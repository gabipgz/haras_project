import { Controller, Post, Get, Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IpfsService } from './ipfs.service';

@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Post('uploadImages')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    console.log('Received files:', files?.length)
    const buffers = files.map(file => file.buffer);
    const cids = await this.ipfsService.uploadImages(buffers);
    return { cids };
  }

  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('files', 10)) // Changed from 'images' to 'files'
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    console.log('Received files:', files?.length)
    const buffers = files.map(file => file.buffer);
    const cids = await this.ipfsService.uploadFiles(buffers); // Changed method name
    return { cids };
  }

  @Get(':cids')
  async getImages(@Param('cids') cids: string) {
    const cidArray = cids.split(',');
    return await this.ipfsService.getImages(cidArray);
  }
} 