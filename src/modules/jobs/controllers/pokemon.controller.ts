import { Controller, Get, Param, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';

const genOnePokemon: string[] = ["Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran","Nidorina","Nidoqueen","Nidoran","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"]

@Controller('/pokemon')
export class PokemonController {
  constructor(private readonly httpService: HttpService) {}

  @Get(['/'])
  async getSpecificPokemon(@Query('id') id: string, @Query('name') name: string) {
    await new Promise(resolve => setTimeout(resolve, 500)); // just adds a delay for feel so request isn't instantaneous.
    

    if (!this.isGenOne(id, name)) {
      return {
        'flowStatus': 'FAILURE',
        'flowStatusMessage': `${id ? 'Invalid id - must be between 1 and 151' : 'Invalid name - name must be a gen one pokemon'} `,
      }
    }

    const pokemonData = await this.getPokemon(id || name);
    
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': '',
      'pokemon': pokemonData,
    }
  }

  private isGenOne(id: string = '0', name: string = ''): boolean {
    if (parseInt(id) >= 1 && parseInt(id) <= 151) {
      return true;
    } else if (genOnePokemon.some(pokemon => pokemon.toLowerCase() === name.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  private async getPokemon(param: string): Promise<Pokemon> {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${param}`;

    const observable = this.httpService.get(apiUrl).pipe(
      map(response => {
        const data = response.data;

        const pokemon: Pokemon = {
          id: data.id,
          name: data.name,
          sprites: {
            front_default: data.sprites.front_default,
          },
        };

        return pokemon;
      })
    );

    const pokemonData = await lastValueFrom(observable);
    return pokemonData;
  }
}
