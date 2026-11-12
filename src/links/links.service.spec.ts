import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LinksService } from './links.service';

describe('LinksService', () => {
  const prisma = {
    category: { findFirst: jest.fn() },
    link: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new LinksService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns paginated links', async () => {
    prisma.link.findMany.mockResolvedValue([]);
    prisma.link.count.mockResolvedValue(0);

    await expect(
      service.findAll({ page: 1, limit: 20, sort: 'newest' }, 'user'),
    ).resolves.toEqual({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  it('filters favorites by the authenticated owner', async () => {
    prisma.link.findMany.mockResolvedValue([]);
    prisma.link.count.mockResolvedValue(0);

    await service.findAll(
      { page: 1, limit: 20, sort: 'newest', isFavorite: 'true' },
      'owner',
    );

    expect(prisma.link.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'owner', isFavorite: true },
      }),
    );
  });

  it.each([true, false])(
    'persists a favorite state of %s for the owned link',
    async (isFavorite) => {
      prisma.link.findFirst.mockResolvedValue({ id: 'link' });
      prisma.link.update.mockResolvedValue({ id: 'link', isFavorite });

      await expect(
        service.updateFavorite('link', isFavorite, 'owner'),
      ).resolves.toEqual({ id: 'link', isFavorite });
      expect(prisma.link.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'link' },
          data: { isFavorite },
        }),
      );
    },
  );

  it('rejects changing the favorite state of another user’s link', async () => {
    prisma.link.findFirst.mockResolvedValue(null);

    await expect(
      service.updateFavorite('private-link', true, 'owner'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.link.update).not.toHaveBeenCalled();
  });

  it('rejects updates for a missing link', async () => {
    prisma.link.findFirst.mockResolvedValue(null);

    await expect(service.update('missing', {}, 'user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns not found for a missing delete target', async () => {
    prisma.link.findFirst.mockResolvedValue(null);

    await expect(service.remove('missing', 'user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('translates a missing category into a client error', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          name: 'Example',
          url: 'https://example.com',
          categoryId: 'missing',
        },
        'user',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
