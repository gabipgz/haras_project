import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly pinataApiKey: string;
  private readonly pinataSecretKey: string;
  private readonly pinataBaseUrl = 'https://api.pinata.cloud';

  constructor(private configService: ConfigService) {
    this.pinataApiKey = this.configService.get<string>('PINATA_API_KEY');
    this.pinataSecretKey = this.configService.get<string>('PINATA_SECRET_KEY');

    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('Pinata API credentials not found in environment variables');
    }
  }

  async uploadImages(imageBuffers: Buffer[]): Promise<string[]> {
    try {
      const uploadPromises = imageBuffers.map(async (buffer) => {
        const formData = new FormData();
        formData.append('file', new Blob([buffer]));

        const response = await axios.post(`${this.pinataBaseUrl}/pinning/pinFileToIPFS`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          },
        });

        return response.data.IpfsHash;
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error('Failed to upload images to Pinata:', error);
      throw error;
    }
  }

  async uploadFiles(fileBuffers: Buffer[]): Promise<string[]> {
    try {
      const uploadPromises = fileBuffers.map(async (buffer) => {
        const formData = new FormData();
        formData.append('file', new Blob([buffer]));

        const response = await axios.post(
          `${this.pinataBaseUrl}/pinning/pinFileToIPFS`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              pinata_api_key: this.pinataApiKey,
              pinata_secret_api_key: this.pinataSecretKey,
            },
          }
        );

        return response.data.IpfsHash;
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error('Failed to upload files to Pinata:', error);
      throw error;
    }
  }

  async getImages(cids: string[]): Promise<Buffer[]> {
    try {
      const downloadPromises = cids.map(async (cid) => {
        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
          responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
      });

      return Promise.all(downloadPromises);
    } catch (error) {
      this.logger.error('Failed to retrieve images from Pinata:', error);
      throw error;
    }
  }
}
