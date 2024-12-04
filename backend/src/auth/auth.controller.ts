import { Controller, Post, Body } from '@nestjs/common';
import { HederaService } from '../hedera/hedera.service';
import { HederaCredentialsDto } from '../dto/hedera-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly hederaService: HederaService) {}

  @Post('login')
  async login(@Body() credentials: HederaCredentialsDto) {
    await this.hederaService.setCredentials(credentials);
    return { message: 'Credentials set successfully' };
  }

  @Post('logout')
  async logout() {
    await this.hederaService.setCredentials(null);
    return { message: 'Logged out successfully' };
  }
} 