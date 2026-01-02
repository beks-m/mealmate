import { Injectable, OnModuleDestroy } from '@nestjs/common';
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
  private sessions = new Map<string, SessionRecord>();

  constructor(
    private readonly toolsService: ToolsService,
    private readonly widgetsService: WidgetsService,
  ) {}

  async onModuleDestroy() {
    for (const [, session] of this.sessions) {
      await session.server.close();
    }
    this.sessions.clear();
  }

  private createMcpServer(): Server {
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
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: this.widgetsService.getResources(),
    }));

    // Read a specific resource
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const widget = this.widgetsService.getWidgetByUri(request.params.uri);

      if (!widget) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

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
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: this.widgetsService.getResourceTemplates(),
    }));

    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.toolsService.getTools(),
    }));

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return this.toolsService.callTool(request.params.name, request.params.arguments ?? {});
    });

    return server;
  }

  async handleSseConnection(res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const server = this.createMcpServer();
    const transport = new SSEServerTransport('/mcp/messages', res);
    const sessionId = transport.sessionId;

    this.sessions.set(sessionId, { server, transport });

    transport.onclose = async () => {
      this.sessions.delete(sessionId);
      await server.close();
    };

    transport.onerror = (error) => {
      console.error('SSE transport error:', error);
    };

    try {
      await server.connect(transport);
    } catch (error) {
      this.sessions.delete(sessionId);
      console.error('Failed to start SSE session:', error);
      if (!res.headersSent) {
        res.status(500).send('Failed to establish SSE connection');
      }
    }
  }

  async handlePostMessage(req: Request, res: Response, sessionId: string) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');

    const session = this.sessions.get(sessionId);

    if (!session) {
      res.status(404).send('Unknown session');
      return;
    }

    try {
      await session.transport.handlePostMessage(req, res);
    } catch (error) {
      console.error('Failed to process message:', error);
      if (!res.headersSent) {
        res.status(500).send('Failed to process message');
      }
    }
  }
}
