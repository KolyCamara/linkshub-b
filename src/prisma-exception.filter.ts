import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

const databaseUnavailableCodes = new Set(['P1001', 'P1008', 'P1017']);

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (error instanceof HttpException) {
      response.status(error.getStatus()).json(error.getResponse());
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (databaseUnavailableCodes.has(error.code)) {
        response.status(503).json({
          statusCode: 503,
          message:
            'Le service de données est temporairement indisponible. Réessayez dans quelques instants.',
        });
        return;
      }

      if (error.code === 'P2025') {
        response
          .status(404)
          .json({ statusCode: 404, message: 'La ressource est introuvable.' });
        return;
      }

      if (error.code === 'P2002') {
        response
          .status(409)
          .json({ statusCode: 409, message: 'Cette ressource existe déjà.' });
        return;
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      response.status(503).json({
        statusCode: 503,
        message:
          'Le service de données est temporairement indisponible. Réessayez dans quelques instants.',
      });
      return;
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      response.status(503).json({
        statusCode: 503,
        message:
          'Le service de données est temporairement indisponible. Réessayez dans quelques instants.',
      });
      return;
    }

    const internalError = new InternalServerErrorException(
      'Une erreur interne est survenue. Réessayez dans quelques instants.',
    );
    response
      .status(internalError.getStatus())
      .json(internalError.getResponse());
  }
}
