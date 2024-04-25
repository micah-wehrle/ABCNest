import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { WeTrackController } from './controllers/we-track.controller';
import { WeTrackService } from './services/we-track/we-track.service';

@Module({
  controllers: [WeTrackController],
  providers: [WeTrackService],
  imports: [HttpModule]
})
export class WeTrackModule {}
