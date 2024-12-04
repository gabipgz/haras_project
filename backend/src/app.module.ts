import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NFTModule } from './nft/nft.module';
import { CollectionModule } from './collection/collection.module';
import { StaticController } from './static.controller';
import { AuthController } from './auth/auth.controller';
import { HederaModule } from './hedera/hedera.module';
import { AuthModule } from './auth/auth.module';
import { IpfsModule } from './ipfs/ipfs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NFTModule,
    CollectionModule,
    AuthModule,
    HederaModule,
    IpfsModule,
  ],
  controllers: [
    StaticController,
    AuthController,
  ],
})
export class AppModule {}