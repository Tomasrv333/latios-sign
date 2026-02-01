import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const app = await NestFactory.create(AppModule);

  // Increase payload limit
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors();
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();


