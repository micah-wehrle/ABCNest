import { Controller, Get, Query } from '@nestjs/common';

import { PokemonService } from '../services/pokemon.service';

@Controller('/pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  /**
   * @description - route is used by frontend to get specific information on a pokemon
   * @param {string} id - string representation of a specific pokemon's id number
   * @param {string} name - the name of a pokemon
   * @returns {boolean} - a JSON object that indicates failure on a bad request or the pokemon data on a successful request
   */
  @Get(['/'])
  async getSpecificPokemon(@Query('id') id: string, @Query('name') name: string) {
    await new Promise(resolve => setTimeout(resolve, 500)); // just adds a delay for feel so request isn't instantaneous.
    

    if (!this.pokemonService.isGenOne(id, name)) {
      return {
        'flowStatus': 'FAILURE',
        'flowStatusMessage': `${id ? 'Invalid id - must be between 1 and 151' : 'Invalid name - name must be a gen one pokemon'} `,
      }
    }

    const pokemonData = await this.pokemonService.getPokemon(id || name);
    
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'Pokemon data successfully retrieved from PokeApi v2',
      'pokemon': pokemonData,
    }
  }
}
