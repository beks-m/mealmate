import { Controller, Get, Post, Req, Res, Query } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service.js';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get()
  async handleSse(@Res() res: Response) {
    await this.mcpService.handleSseConnection(res);
  }

  @Post('messages')
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
