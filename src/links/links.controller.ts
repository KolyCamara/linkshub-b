import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { ListLinksDto } from './dto/list-links.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { LinksService } from './links.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('links')
@UseGuards(AuthGuard)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  findAll(@Query() query: ListLinksDto, @Req() request: AuthenticatedRequest) {
    return this.linksService.findAll(query, request.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.linksService.findOne(id, request.user.id);
  }

  @Patch(':id/favorite')
  updateFavorite(
    @Param('id') id: string,
    @Body() dto: UpdateFavoriteDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.linksService.updateFavorite(
      id,
      dto.isFavorite,
      request.user.id,
    );
  }

  @Post()
  create(@Body() dto: CreateLinkDto, @Req() request: AuthenticatedRequest) {
    return this.linksService.create(dto, request.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLinkDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.linksService.update(id, dto, request.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.linksService.remove(id, request.user.id);
  }
}
