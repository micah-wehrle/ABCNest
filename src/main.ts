import { NestFactory } from '@nestjs/core';

import { AbcNestModule } from './modules/abc-nest.module';

async function bootstrap() {
  const app = await NestFactory.create(AbcNestModule);
  app.enableCors(); // Required for local testing
  await app.listen(3000);
}

bootstrap();
