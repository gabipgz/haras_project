import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CredentialsStoreService } from '../hedera/credentials-store.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private credentialsStore: CredentialsStoreService) {}

  canActivate(context: ExecutionContext): boolean {
    const credentials = this.credentialsStore.getCredentials();
    if (!credentials) {
      throw new UnauthorizedException('Please login first');
    }
    return true;
  }
} 