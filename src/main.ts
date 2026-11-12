import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5500',
    credentials: true,
  });
  const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:5500';
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (
      ['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method) &&
      request.headers.origin &&
      request.headers.origin !== frontendOrigin
    ) {
      response
        .status(403)
        .json({ message: 'Origine de requête non autorisée.' });
      return;
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
