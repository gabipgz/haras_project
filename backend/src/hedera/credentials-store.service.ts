import { Injectable } from '@nestjs/common';

@Injectable()
export class CredentialsStoreService {
  private credentials: { accountId: string; privateKey: string } | null = null;

  setCredentials(credentials: { accountId: string; privateKey: string }) {
    this.credentials = credentials;
  }

  getCredentials() {
    return this.credentials;
  }

  clearCredentials() {
    this.credentials = null;
  }
} 