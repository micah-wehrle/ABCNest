import { NestFactory } from '@nestjs/core';
import { JobsModule } from './jobs/jobs.module';

async function bootstrap() {
  const app = await NestFactory.create(JobsModule);
  app.enableCors();
  await app.listen(3000);
}

bootstrap();
