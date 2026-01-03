import { Controller, Get, Post, Options, Req, Res, Query } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service.js';

@Controller()
export class McpController {
  constructor(private readonly mcpService: McpService) {}


  // CORS preflight for /mcp
  @Options('mcp')
  handleMcpOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.status(204).end();
  }

  // CORS preflight for /mcp/messages
  @Options('mcp/messages')
  handleMessagesOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.status(204).end();
  }

  // MCP SSE endpoint
  @Get('mcp')
  async handleSse(@Res() res: Response) {
    await this.mcpService.handleSseConnection(res);
  }

  // MCP messages endpoint
  @Post('mcp/messages')
  async handleMessage(
    @Req() req: Request,
    @Res() res: Response,
    @Query('sessionId') sessionId: string,
  ) {
    if (!sessionId) {
      res.status(400).send('Missing sessionId query parameter');
      return;
    }

    await this.mcpService.handlePostMessage(req, res, sessionId);
  }
}
