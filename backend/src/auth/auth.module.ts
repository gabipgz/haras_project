import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { HederaModule } from '../hedera/hedera.module';

@Module({
  imports: [
    ConfigModule,
    HederaModule,
  ],
  controllers: [AuthController],
})
export class AuthModule {} 