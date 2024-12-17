import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // CORS configuration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  const isExternalHost = process.env.EXTERNAL_HOST === 'true';
  
  if (isExternalHost) {
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://34.56.65.192:${port}`);
  } else {
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }
}
bootstrap();