import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  const createKnownError = (
    code: string,
  ): Prisma.PrismaClientKnownRequestError => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as Prisma.PrismaClientKnownRequestError;
    Object.defineProperty(error, 'code', { value: code });
    return error;
  };

  const createHost = () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return {
      response,
      host: {
        switchToHttp: () => ({
          getResponse: () => response,
        }),
      } as never,
    };
  };

  it('returns 503 without exposing Prisma details for P1001', () => {
    const error = createKnownError('P1001');
    const { host, response } = createHost();

    new PrismaExceptionFilter().catch(error, host);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 503,
      message:
        'Le service de données est temporairement indisponible. Réessayez dans quelques instants.',
    });
  });

  it('returns 404 for a missing Prisma resource', () => {
    const error = createKnownError('P2025');
    const { host, response } = createHost();

    new PrismaExceptionFilter().catch(error, host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'La ressource est introuvable.',
    });
  });
});
