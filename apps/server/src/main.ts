import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Disable body parsing - MCP SSE transport needs raw stream access
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
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
