import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

async function bootstrap() {
  // StreamableHTTPServerTransport accepts parsed body, so enable body parsing
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['content-type'],
  });

  // Serve widget assets statically
  // Try multiple paths for different deployment environments
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  const possiblePaths = [
    join(__dirname, '..', '..', 'widget', 'dist', 'assets'),  // From dist/
    join(__dirname, '..', '..', '..', 'widget', 'dist', 'assets'),  // From src/
    join(process.cwd(), 'apps', 'widget', 'dist', 'assets'),  // From cwd
    join(process.cwd(), 'widget', 'dist', 'assets'),  // Alternative cwd
  ];

  let widgetAssetsPath: string | null = null;
  for (const path of possiblePaths) {
    console.log(`Checking widget assets at: ${path}`);
    if (existsSync(path)) {
      widgetAssetsPath = path;
      break;
    }
  }

  if (widgetAssetsPath) {
    app.useStaticAssets(widgetAssetsPath, { prefix: '/widget-assets/' });
    console.log(`Serving widget assets from: ${widgetAssetsPath}`);
  } else {
    console.warn('Widget assets not found! Checked paths:', possiblePaths);
  }

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  console.log(`MealMate MCP server listening on http://localhost:${port}`);
}

bootstrap();
