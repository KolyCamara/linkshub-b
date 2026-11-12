import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddLinkDto } from './dto/add-link.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.collection.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { links: true } },
        links: { select: { id: true } },
      },
    });
  }

  async findOne(id: string, ownerId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, ownerId },
      include: { links: { include: { category: true } } },
    });
    if (!collection) {
      throw new NotFoundException(`La collection ${id} est introuvable.`);
    }
    return collection;
  }

  create(dto: CreateCollectionDto, ownerId: string) {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Le nom de la collection est obligatoire.');
    }
    return this.prisma.collection.create({
      data: {
        name,
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
        owner: { connect: { id: ownerId } },
      },
      include: { _count: { select: { links: true } } },
    });
  }

  async update(id: string, dto: UpdateCollectionDto, ownerId: string) {
    await this.findOne(id, ownerId);
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new BadRequestException('Le nom de la collection est obligatoire.');
    }
    return this.prisma.collection.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
      },
      include: { _count: { select: { links: true } } },
    });
  }

  async remove(id: string, ownerId: string) {
    await this.findOne(id, ownerId);
    await this.prisma.collection.delete({ where: { id } });
    return { id, deleted: true as const };
  }

  async addLink(id: string, dto: AddLinkDto, ownerId: string) {
    await this.findOne(id, ownerId);
    const link = await this.prisma.link.findFirst({
      where: { id: dto.linkId, userId: ownerId },
      select: { id: true },
    });
    if (!link) {
      throw new NotFoundException(`Le lien ${dto.linkId} est introuvable.`);
    }
    await this.prisma.collection.update({
      where: { id },
      data: { links: { connect: { id: link.id } } },
    });
    return this.findOne(id, ownerId);
  }

  async removeLink(id: string, linkId: string, ownerId: string) {
    await this.findOne(id, ownerId);
    const link = await this.prisma.link.findFirst({
      where: { id: linkId, userId: ownerId },
      select: { id: true },
    });
    if (!link) {
      throw new NotFoundException(`Le lien ${linkId} est introuvable.`);
    }
    await this.prisma.collection.update({
      where: { id },
      data: { links: { disconnect: { id: link.id } } },
    });
    return this.findOne(id, ownerId);
  }
}
