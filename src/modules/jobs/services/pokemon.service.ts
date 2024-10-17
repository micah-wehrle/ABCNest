import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios"
import { map, lastValueFrom } from "rxjs";

import { Pokemon } from "../models/pokemon.model"

@Injectable()
export class PokemonService {
  private readonly apiUrl: string = 'https://pokeapi.co/api/v2/pokemon';
  private genOnePokemon: string[] = ["Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran","Nidorina","Nidoqueen","Nidoran","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"]

  constructor(private readonly httpService: HttpService) {}

  /**
   * @description - function that validates if a pokemon belongs to the generation one pokedex
   * @param {string} id  - string representation of a specific pokemon's id number
   * @param {string} name - the name of a pokemon
   * @returns {boolean} - returns true if a valid generation one pokemon and false otherwise
   */
  public isGenOne(id: string = '0', name: string = ''): boolean {
    const pokeId: number = parseInt(id);

    if (pokeId >= 1 && pokeId <= 151) {
      return true;
    } else if (this.genOnePokemon.some(pokemon => pokemon.toLowerCase() === name.toLowerCase())) { // validates whether the name of a pokemon exists in the names of all generation one pokedex pokemon
      return true;
    } else {
      return false;
    }
  }

  /**
   * @description - function that sends a GET requests to the pokemon API for a specific pokemon
   * @param {string} param - a parameter that is either the pokemon's Id or it's name 
   * @returns {Pokemon} - returns a pokemon object
   */
  public async getPokemon(param: string): Promise<Pokemon> {
    if (!this.isGenOne(param, param)) {
      throw new HttpException({
        httpStatusCode: HttpStatus.NOT_FOUND,
        flowStatus: 'FAILURE',
        flowStatusMessage: 'Pokemon ID or name parameters due not correspond to a generation one pokemon',
        customError: true,
      }, HttpStatus.NOT_FOUND)
    }

    const observable = this.httpService.get(`${this.apiUrl}/${param}`).pipe(
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