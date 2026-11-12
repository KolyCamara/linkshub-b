import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { AddLinkDto } from './dto/add-link.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionsService } from './collections.service';

@Controller('collections')
@UseGuards(AuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.collectionsService.findAll(request.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.collectionsService.findOne(id, request.user.id);
  }

  @Post()
  create(
    @Body() dto: CreateCollectionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.collectionsService.create(dto, request.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.collectionsService.update(id, dto, request.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.collectionsService.remove(id, request.user.id);
  }

  @Post(':id/links')
  addLink(
    @Param('id') id: string,
    @Body() dto: AddLinkDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.collectionsService.addLink(id, dto, request.user.id);
  }

  @Delete(':id/links/:linkId')
  removeLink(
    @Param('id') id: string,
    @Param('linkId') linkId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.collectionsService.removeLink(id, linkId, request.user.id);
  }
}
