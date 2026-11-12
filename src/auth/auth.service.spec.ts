import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const service = new AuthService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.session.create.mockResolvedValue({});
  });

  it('hashes the password during registration', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      fullName: 'Ada Lovelace',
      email: 'a@example.com',
    });

    await service.register({
      fullName: 'Ada Lovelace',
      email: ' A@EXAMPLE.COM ',
      password: 'a-secure-password',
    });

    expect(jest.mocked(hash)).toHaveBeenCalledWith('a-secure-password', 12);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate accounts', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        fullName: 'Ada Lovelace',
        email: 'a@example.com',
        password: 'a-secure-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('uses a generic error for invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jest.mocked(compare)).not.toHaveBeenCalled();
  });

  it('rejects expired or missing sessions', async () => {
    prisma.session.findUnique.mockResolvedValue(null);

    await expect(service.getUserFromToken('invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
