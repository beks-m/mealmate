import { Controller, Get, Post, Req, Res, Query } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service.js';

@Controller()
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  // Health check at root
  @Get()
  healthCheck() {
    return { status: 'ok', service: 'mealmate-mcp' };
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
