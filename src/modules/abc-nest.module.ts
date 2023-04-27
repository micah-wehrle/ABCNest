import { Module } from "@nestjs/common";

import { JobsModule } from "./jobs/jobs.module";
import { WeTrackModule } from "./we-track/we-track.module";
import { WeatherModule } from './weather/weather.module';
import { TouchNGoModule } from './touch-n-go/touch-n-go.module';

/**
 * @description - This is the primary module for our ABC Nest project, to be instantiated at whatever port. Any child module goes in the imports: [] section of the Module decorator.
 */
@Module({
  imports: [JobsModule, WeTrackModule, WeatherModule, TouchNGoModule],
})
export class AbcNestModule {}