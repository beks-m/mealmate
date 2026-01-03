import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  isInitializeRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { ToolsService } from './tools.service.js';
import { WidgetsService } from './widgets.service.js';
import { randomUUID } from 'crypto';

interface SessionRecord {
  server: Server;
  transport: StreamableHTTPServerTransport;
}

@Injectable()
export class McpService implements OnModuleDestroy {
  private readonly logger = new Logger(McpService.name);
  private sessions = new Map<string, SessionRecord>();

  constructor(
    private readonly toolsService: ToolsService,
    private readonly widgetsService: WidgetsService,
  ) {
    this.logger.log('McpService initialized');
  }

  async onModuleDestroy() {
    for (const [, session] of this.sessions) {
      await session.server.close();
    }
    this.sessions.clear();
  }

  private createMcpServer(): Server {
    this.logger.log('Creating new MCP server instance');

    const server = new Server(
      {
        name: 'mealmate',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    );

    // List available resources (widget templates)
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
      this.logger.log('Handler: ListResources called');
      const resources = this.widgetsService.getResources();
      this.logger.log(`Returning ${resources.length} resources`);
      return { resources };
    });

    // Read a specific resource
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      this.logger.log(`Handler: ReadResource called for URI: ${request.params.uri}`);
      const widget = this.widgetsService.getWidgetByUri(request.params.uri);

      if (!widget) {
        this.logger.error(`Unknown resource: ${request.params.uri}`);
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      this.logger.log(`Returning widget: ${widget.id}`);
      return {
        contents: [
          {
            uri: widget.templateUri,
            mimeType: 'text/html+skybridge',
            text: widget.html,
            _meta: this.widgetsService.getWidgetMeta(widget),
          },
        ],
      };
    });

    // List resource templates
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
      this.logger.log('Handler: ListResourceTemplates called');
      const resourceTemplates = this.widgetsService.getResourceTemplates();
      this.logger.log(`Returning ${resourceTemplates.length} resource templates`);
      return { resourceTemplates };
    });

    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.log('Handler: ListTools called');
      const tools = this.toolsService.getTools();
      this.logger.log(`Returning ${tools.length} tools`);
      return { tools };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      this.logger.log(`Handler: CallTool called for tool: ${request.params.name}`);
      this.logger.log(`Tool arguments: ${JSON.stringify(request.params.arguments)}`);
      try {
        const result = await this.toolsService.callTool(request.params.name, request.params.arguments ?? {});
        this.logger.log(`Tool ${request.params.name} completed successfully`);
        this.logger.log(`Result keys: ${Object.keys(result).join(', ')}`);
        if (result.structuredContent) {
          this.logger.log(`structuredContent keys: ${Object.keys(result.structuredContent).join(', ')}`);
        }
        return result;
      } catch (error) {
        this.logger.error(`Tool ${request.params.name} failed:`, error);
        throw error;
      }
    });

    this.logger.log('MCP server instance created with all handlers registered');
    return server;
  }

  async handleRequest(req: Request, res: Response) {
    this.logger.log(`=== MCP Request: ${req.method} ===`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, mcp-session-id');
    res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    this.logger.log(`Session ID from header: ${sessionId || 'none'}`);

    // Handle GET requests (SSE stream for notifications)
    if (req.method === 'GET') {
      if (!sessionId || !this.sessions.has(sessionId)) {
        this.logger.error('GET request without valid session');
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Invalid session' },
          id: null,
        });
        return;
      }

      const session = this.sessions.get(sessionId)!;
      await session.transport.handleRequest(req, res);
      return;
    }

    // Handle DELETE requests (close session)
    if (req.method === 'DELETE') {
      if (sessionId && this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId)!;
        await session.transport.handleRequest(req, res);
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Invalid session' },
          id: null,
        });
      }
      return;
    }

    // Handle POST requests
    if (req.method === 'POST') {
      let transport: StreamableHTTPServerTransport;

      if (sessionId && this.sessions.has(sessionId)) {
        // Reuse existing session
        this.logger.log(`Reusing existing session: ${sessionId}`);
        transport = this.sessions.get(sessionId)!.transport;
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New session initialization
        this.logger.log('Creating new session for initialize request');

        const server = this.createMcpServer();

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            this.logger.log(`Session initialized and stored: ${id}`);
            this.sessions.set(id, { server, transport });
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) {
            this.logger.log(`Session closed: ${sid}`);
            this.sessions.delete(sid);
          }
        };

        await server.connect(transport);
      } else {
        // Invalid request - no session and not initialize
        this.logger.error('POST request without session and not initialize');
        res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Bad Request: No valid session' },
          id: null,
        });
        return;
      }

      // Handle the request with parsed body
      await transport.handleRequest(req, res, req.body);
      return;
    }

    // Unknown method
    res.status(405).send('Method not allowed');
  }
}
