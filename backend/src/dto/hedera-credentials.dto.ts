import { IsString, Matches } from 'class-validator';

export class HederaCredentialsDto {
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Invalid Hedera account ID format' })
  accountId: string;

  @IsString()
  privateKey: string;
} 