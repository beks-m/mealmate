import { Controller, Get, Options, Req, Res, Logger, All } from '@nestjs/common';
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, mcp-session-id');
    res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');
    res.status(204).end();
  }

  // Unified MCP endpoint - handles all methods
  @All('mcp')
  async handleMcp(@Req() req: Request, @Res() res: Response) {
    // Skip OPTIONS - handled above
    if (req.method === 'OPTIONS') return;

    this.logger.log(`=== ${req.method} /mcp called ===`);
    this.logger.log(`Headers: ${JSON.stringify(req.headers)}`);
    await this.mcpService.handleRequest(req, res);
  }
}
