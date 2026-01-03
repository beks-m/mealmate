import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { fileURLToPath } from 'url';

async function bootstrap() {
  // StreamableHTTPServerTransport accepts parsed body, so enable body parsing
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['content-type'],
  });

  // Serve widget assets statically
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  const widgetAssetsPath = join(__dirname, '..', '..', 'widget', 'dist', 'assets');
  app.useStaticAssets(widgetAssetsPath, { prefix: '/widget-assets/' });
  console.log(`Serving widget assets from: ${widgetAssetsPath}`);

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  console.log(`MealMate MCP server listening on http://localhost:${port}`);
  console.log(`  Widget assets: http://localhost:${port}/widget-assets/`);
}

bootstrap();
