import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CollectionsService } from './collections.service';

describe('CollectionsService', () => {
  const prisma = {
    collection: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    link: { findFirst: jest.fn() },
  };
  const service = new CollectionsService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('lists only the authenticated owner’s collections', async () => {
    prisma.collection.findMany.mockResolvedValue([]);
    await service.findAll('owner');
    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ownerId: 'owner' } }),
    );
  });

  it.each(['update', 'remove'] as const)(
    'rejects %s for another user’s collection',
    async (operation) => {
      prisma.collection.findFirst.mockResolvedValue(null);
      if (operation === 'update') {
        await expect(
          service.update('private-collection', { name: 'Changed' }, 'owner'),
        ).rejects.toBeInstanceOf(NotFoundException);
      } else {
        await expect(
          service.remove('private-collection', 'owner'),
        ).rejects.toBeInstanceOf(NotFoundException);
      }
      expect(prisma.collection.update).not.toHaveBeenCalled();
      expect(prisma.collection.delete).not.toHaveBeenCalled();
    },
  );

  it('creates a collection with the server-provided owner', async () => {
    prisma.collection.create.mockResolvedValue({ id: 'collection' });
    await service.create(
      { name: '  Études  ', description: '  À lire  ' },
      'owner',
    );
    expect(prisma.collection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: 'Études',
          description: 'À lire',
          owner: { connect: { id: 'owner' } },
        },
      }),
    );
  });

  it('rejects a blank collection name', () => {
    expect(() => service.create({ name: '   ' }, 'owner')).toThrow(
      BadRequestException,
    );
  });

  it('does not expose a collection owned by another user', async () => {
    prisma.collection.findFirst.mockResolvedValue(null);
    await expect(
      service.findOne('private-collection', 'owner'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.collection.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'private-collection', ownerId: 'owner' },
      }),
    );
  });

  it('updates only an owned collection', async () => {
    prisma.collection.findFirst.mockResolvedValue({ id: 'collection' });
    prisma.collection.update.mockResolvedValue({ id: 'collection' });
    await service.update('collection', { name: 'Nouveau nom' }, 'owner');
    expect(prisma.collection.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'collection' },
        data: { name: 'Nouveau nom' },
      }),
    );
  });

  it('deletes only the collection and its relations, preserving links', async () => {
    prisma.collection.findFirst.mockResolvedValue({ id: 'collection' });
    prisma.collection.delete.mockResolvedValue({ id: 'collection' });
    await expect(service.remove('collection', 'owner')).resolves.toEqual({
      id: 'collection',
      deleted: true,
    });
    expect(prisma.collection.delete).toHaveBeenCalledWith({
      where: { id: 'collection' },
    });
  });

  it('adds the same owned link to multiple collections', async () => {
    prisma.collection.findFirst.mockResolvedValue({ id: 'collection' });
    prisma.link.findFirst.mockResolvedValue({ id: 'link' });
    prisma.collection.update.mockResolvedValue({});

    await service.addLink('collection-one', { linkId: 'link' }, 'owner');
    await service.addLink('collection-two', { linkId: 'link' }, 'owner');

    expect(prisma.collection.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: 'collection-one' },
        data: { links: { connect: { id: 'link' } } },
      }),
    );
    expect(prisma.collection.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: 'collection-two' },
        data: { links: { connect: { id: 'link' } } },
      }),
    );
  });

  it('rejects adding another user’s link to a collection', async () => {
    prisma.collection.findFirst.mockResolvedValue({ id: 'collection' });
    prisma.link.findFirst.mockResolvedValue(null);

    await expect(
      service.addLink('collection', { linkId: 'private-link' }, 'owner'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.collection.update).not.toHaveBeenCalled();
  });

  it('removes a link from an owned collection', async () => {
    prisma.collection.findFirst.mockResolvedValue({ id: 'collection' });
    prisma.link.findFirst.mockResolvedValue({ id: 'link' });
    prisma.collection.update.mockResolvedValue({});

    await service.removeLink('collection', 'link', 'owner');
    expect(prisma.collection.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { links: { disconnect: { id: 'link' } } },
      }),
    );
  });
});
