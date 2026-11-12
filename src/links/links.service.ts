import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksDto } from './dto/list-links.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { PrismaService } from '../prisma.service';

const linkInclude = { category: true } satisfies Prisma.LinkInclude;
type LinkWithCategory = Prisma.LinkGetPayload<{ include: typeof linkInclude }>;

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListLinksDto, userId: string) {
    const where: Prisma.LinkWhereInput = {
      userId,
      ...(query.isFavorite !== undefined
        ? { isFavorite: query.isFavorite === 'true' }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.type ? { resourceType: query.type } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { url: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };
    const orderBy =
      query.sort === 'oldest'
        ? { createdAt: 'asc' as const }
        : query.sort === 'name_asc'
          ? { name: 'asc' as const }
          : query.sort === 'name_desc'
            ? { name: 'desc' as const }
            : { createdAt: 'desc' as const };
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.link.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: linkInclude,
      }),
      this.prisma.link.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<LinkWithCategory> {
    const link = await this.prisma.link.findFirst({
      where: { id, userId },
      include: linkInclude,
    });
    if (!link) {
      throw new NotFoundException(`Le lien ${id} est introuvable.`);
    }

    return link;
  }

  async create(dto: CreateLinkDto, userId: string): Promise<LinkWithCategory> {
    try {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, userId },
      });
      if (!category) {
        throw new BadRequestException('La catégorie indiquée est introuvable.');
      }
      return await this.prisma.link.create({
        data: {
          name: dto.name,
          url: dto.url,
          description: dto.description,
          resourceType: dto.resourceType,
          user: { connect: { id: userId } },
          category: { connect: { id: category.id } },
        },
        include: linkInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException('La catégorie indiquée est introuvable.');
      }
      throw error;
    }
  }

  async updateFavorite(id: string, isFavorite: boolean, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.link.update({
      where: { id },
      data: { isFavorite },
      include: linkInclude,
    });
  }

  async update(
    id: string,
    dto: UpdateLinkDto,
    userId: string,
  ): Promise<LinkWithCategory> {
    await this.findOne(id, userId);
    try {
      if (dto.categoryId !== undefined) {
        const category = await this.prisma.category.findFirst({
          where: { id: dto.categoryId, userId },
        });
        if (!category) {
          throw new BadRequestException(
            'La catégorie indiquée est introuvable.',
          );
        }
      }
      return await this.prisma.link.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.url !== undefined ? { url: dto.url } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.resourceType !== undefined
            ? { resourceType: dto.resourceType }
            : {}),
          ...(dto.categoryId !== undefined
            ? {
                category: {
                  connect: { id: dto.categoryId },
                },
              }
            : {}),
        },
        include: linkInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Le lien ${id} est introuvable.`);
      }
      throw error;
    }
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<{ id: string; deleted: true }> {
    await this.findOne(id, userId);
    try {
      await this.prisma.link.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Le lien ${id} est introuvable.`);
      }
      throw error;
    }
    return { id, deleted: true };
  }
}
