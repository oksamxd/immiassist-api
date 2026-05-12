import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  // Serve static frontend
  const publicPath = join(process.cwd(), 'public');
  if (fs.existsSync(publicPath)) {
    app.useStaticAssets(publicPath, { prefix: '/' });
  }

  // Serve uploaded files
  const uploadsPath = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 ImmiAssist API running on http://localhost:${port}/api`);
  console.log(`🌐 Frontend available at http://localhost:${port}/`);
}
bootstrap();
