import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

async function bootstrap() {
  // Disable default body parsing - MCP SSE transport needs raw stream access
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // Only apply JSON body parsing to non-MCP routes
  app.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/mcp')) {
      // Skip body parsing for MCP routes - SSEServerTransport needs raw stream
      next();
    } else {
      json()(req, res, next);
    }
  });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['content-type'],
  });

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  console.log(`MealMate MCP server listening on http://localhost:${port}`);
  console.log(`  SSE stream: GET http://localhost:${port}/mcp`);
  console.log(`  Message post endpoint: POST http://localhost:${port}/mcp/messages?sessionId=...`);
}

bootstrap();
