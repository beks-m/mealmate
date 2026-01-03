import { Controller, Get, Post, Options, Req, Res, Query, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service.js';

@Controller()
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly mcpService: McpService) {
    this.logger.log('McpController initialized');
  }

  // Health check at root
  @Get()
  healthCheck() {
    this.logger.log('Health check called');
    return { status: 'ok', service: 'mealmate-mcp' };
  }

  // CORS preflight for /mcp
  @Options('mcp')
  handleMcpOptions(@Res() res: Response) {
    this.logger.log('OPTIONS /mcp called');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.status(204).end();
  }

  // CORS preflight for /mcp/messages
  @Options('mcp/messages')
  handleMessagesOptions(@Res() res: Response) {
    this.logger.log('OPTIONS /mcp/messages called');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.status(204).end();
  }

  // MCP SSE endpoint
  @Get('mcp')
  async handleSse(@Req() req: Request, @Res() res: Response) {
    this.logger.log('=== GET /mcp (SSE) called ===');
    this.logger.log(`Request URL: ${req.url}`);
    this.logger.log(`Request headers: ${JSON.stringify(req.headers)}`);
    await this.mcpService.handleSseConnection(res);
  }

  // MCP messages endpoint
  @Post('mcp/messages')
  async handleMessage(
    @Req() req: Request,
    @Res() res: Response,
    @Query('sessionId') sessionId: string,
  ) {
    this.logger.log('=== POST /mcp/messages called ===');
    this.logger.log(`Session ID from query: ${sessionId}`);
    this.logger.log(`Full URL: ${req.url}`);

    if (!sessionId) {
      this.logger.error('Missing sessionId query parameter');
      res.status(400).send('Missing sessionId query parameter');
      return;
    }

    await this.mcpService.handlePostMessage(req, res, sessionId);
  }
}
