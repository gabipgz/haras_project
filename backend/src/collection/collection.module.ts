import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { HederaModule } from 'src/hedera/hedera.module';

@Module({
  imports: [
    ConfigModule,
    HederaModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}