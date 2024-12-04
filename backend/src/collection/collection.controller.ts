import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { AuthGuard } from '../auth/auth.guard';
@Controller('collection')
@UseGuards(AuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  async createCollection(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionService.createCollection(createCollectionDto);
  }

  @Get()
  async getCollections() {
    return this.collectionService.getCollections();
  }

  @Get(':collectionId')
  async getCollection(@Param('collectionId') collectionId: string) {
    return this.collectionService.getCollection(collectionId);
  }

  @Get(':collectionId/assets')
  async getAssetsInCollection(@Param('collectionId') collectionId: string) {
    return this.collectionService.getAssetsInCollection(collectionId);
  }
}