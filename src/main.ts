import { NestFactory } from '@nestjs/core';
import { AbcNestModule } from './abc-nest.module';

async function bootstrap() {
  const app = await NestFactory.create(AbcNestModule);
  app.enableCors();
  await app.listen(3000);
}

bootstrap();
