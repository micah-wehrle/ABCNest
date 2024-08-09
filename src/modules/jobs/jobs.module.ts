import { Module } from '@nestjs/common';

import { JobsController } from './controllers/jobs.controller';
import { NumVerifyController } from './controllers/num-verify.controller';
import { NumVerifyService } from './services/num-verify.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [JobsController, NumVerifyController],
  providers: [NumVerifyService],
  imports: [HttpModule]
})
export class JobsModule {}
