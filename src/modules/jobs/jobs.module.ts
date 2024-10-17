import { Module } from '@nestjs/common';

import { JobsController } from './controllers/jobs.controller';
import { PokemonController } from './controllers/pokemon.controller';
import { HttpModule } from '@nestjs/axios';
import { PokemonService } from './services/pokemon.service';

@Module({
  controllers: [JobsController, PokemonController],
  imports: [HttpModule],
  providers: [PokemonService]
})
export class JobsModule {}
