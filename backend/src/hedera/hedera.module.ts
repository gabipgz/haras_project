import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HederaService } from './hedera.service';
import { CredentialsStoreService } from './credentials-store.service';

@Module({
  imports: [ConfigModule],
  providers: [HederaService, CredentialsStoreService],
  exports: [HederaService, CredentialsStoreService],
})
export class HederaModule {} 