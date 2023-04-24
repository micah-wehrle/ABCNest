import { Module } from '@nestjs/common';
import { WeTrackController } from './controllers/we-track.controller';

@Module({
  controllers: [WeTrackController]
})
export class WeTrackModule {}
