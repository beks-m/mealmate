import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ToolsService } from './tools.service.js';
import { WidgetsService } from './widgets.service.js';

interface SessionRecord {
  server: Server;
  transport: SSEServerTransport;
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
        return result;
      } catch (error) {
        this.logger.error(`Tool ${request.params.name} failed:`, error);
        throw error;
      }
    });

    this.logger.log('MCP server instance created with all handlers registered');
    return server;
  }

  async handleSseConnection(res: Response) {
    this.logger.log('=== SSE Connection Started ===');
    this.logger.log(`Active sessions before: ${this.sessions.size}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const server = this.createMcpServer();
    const transport = new SSEServerTransport('/mcp/messages', res);
    const sessionId = transport.sessionId;

    this.logger.log(`New session created: ${sessionId}`);
    this.sessions.set(sessionId, { server, transport });

    // Keep-alive ping every 25 seconds to prevent proxy timeouts
    const keepAlive = setInterval(() => {
      if (!res.writableEnded) {
        res.write(':keepalive\n\n');
        this.logger.debug(`Keepalive sent for session: ${sessionId}`);
      }
    }, 25000);

    let isClosed = false;
    transport.onclose = async () => {
      if (isClosed) return; // Prevent infinite recursion
      isClosed = true;
      this.logger.log(`SSE connection closed for session: ${sessionId}`);
      clearInterval(keepAlive);
      this.sessions.delete(sessionId);
      try {
        await server.close();
      } catch (error) {
        this.logger.error(`Error closing server for session ${sessionId}:`, error);
      }
    };

    transport.onerror = (error) => {
      this.logger.error(`SSE transport error for session ${sessionId}:`, error);
      clearInterval(keepAlive);
    };

    try {
      this.logger.log(`Connecting server to transport for session: ${sessionId}`);
      await server.connect(transport);
      this.logger.log(`Server connected successfully for session: ${sessionId}`);
    } catch (error) {
      clearInterval(keepAlive);
      this.sessions.delete(sessionId);
      this.logger.error(`Failed to start SSE session ${sessionId}:`, error);
      if (!res.headersSent) {
        res.status(500).send('Failed to establish SSE connection');
      }
    }
  }

  async handlePostMessage(req: Request, res: Response, sessionId: string) {
    this.logger.log(`=== POST Message Received ===`);
    this.logger.log(`Session ID: ${sessionId}`);
    this.logger.log(`Request headers: ${JSON.stringify(req.headers)}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');

    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.error(`Session not found: ${sessionId}`);
      this.logger.log(`Active sessions: ${Array.from(this.sessions.keys()).join(', ')}`);
      res.status(404).send('Unknown session');
      return;
    }

    this.logger.log(`Session found, processing message...`);

    try {
      await session.transport.handlePostMessage(req, res);
      this.logger.log(`Message processed successfully for session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to process message for session ${sessionId}:`, error);
      if (!res.headersSent) {
        res.status(500).send('Failed to process message');
      }
    }
  }
}
