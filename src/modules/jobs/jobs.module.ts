import { Module } from '@nestjs/common';

import { JobsController } from './controllers/jobs.controller';
import { PokemonController } from './controllers/pokemon.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [JobsController, PokemonController],
  imports: [HttpModule]
})
export class JobsModule {}
