import { Module } from "@nestjs/common";

import { JobsModule } from "./modules/jobs/jobs.module";
import { WeTrackModule } from "./modules/we-track/we-track.module";

/**
 * @description - This is the primary module for our ABC Nest project, to be instantiated at whatever port. Any child module goes in the imports: [] section of the Module decorator.
 */
@Module({
  imports: [JobsModule, WeTrackModule],
})
export class AbcNestModule {}