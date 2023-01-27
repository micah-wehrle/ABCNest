import { Module } from '@nestjs/common';
import { JobsController } from './controllers/jobs.controller';

@Module({
  controllers: [JobsController]
})
export class JobsModule {}
