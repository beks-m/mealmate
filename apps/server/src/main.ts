import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
