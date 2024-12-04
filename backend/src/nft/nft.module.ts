import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NFTController } from './nft.controller';
import { NFTService } from './nft.service';
import { HederaModule } from '../hedera/hedera.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HederaModule,
  ],
  controllers: [NFTController],
  providers: [NFTService],
})
export class NFTModule {}