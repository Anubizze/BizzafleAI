import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { mkdirSync } from 'fs';
import helmet from 'helmet';
import path from 'path';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger';

async function bootstrap(): Promise<void> {
  const logger = new AppLogger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  const config = app.get(ConfigService);
  const prefix = config.get<string>('API_PREFIX') ?? 'api/v1';
  const origin = config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
  const port = Number(config.get('API_PORT') ?? 4000);
  const host = config.get<string>('API_HOST') ?? '0.0.0.0';
  const uploadDir = path.resolve(config.get<string>('UPLOAD_DIR') ?? './uploads');

  mkdirSync(uploadDir, { recursive: true });

  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  const swagger = new DocumentBuilder()
    .setTitle('Bizaffle AI API')
    .setDescription('Казахстанский SaaS для предпринимателей — REST API v1')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addCookieAuth('refresh_token')
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: false });

  await app.listen(port, host);
  logger.log(`API listening on http://${host}:${port}/${prefix}`);
  logger.log(`Swagger: http://${host}:${port}/docs`);
}

bootstrap().catch((error: unknown) => {
  const logger = new AppLogger('Bootstrap');
  logger.error({
    msg: 'bootstrap_failed',
    name: error instanceof Error ? error.name : 'Error',
  });
  process.exit(1);
});
