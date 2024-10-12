import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios"
import { map, lastValueFrom } from "rxjs";

import { Pokemon } from "../models/pokemon.model"

@Injectable()
export class PokemonService {
  private genOnePokemon: string[] = ["Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran","Nidorina","Nidoqueen","Nidoran","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"]

  constructor(private readonly httpService: HttpService) {}

  /**
   * 
   * @param {string} id  - string representation of a specific pokemon's id number
   * @param {string} name - the name of a pokemon
   * @returns {boolean} - returns true if a valid generation one pokemon and false otherwise
   */
  public isGenOne(id: string = '0', name: string = ''): boolean {
    const pokeId: number = parseInt(id);

    if (pokeId >= 1 && pokeId <= 151) {
      return true;
    } else if (this.genOnePokemon.some(pokemon => pokemon.toLowerCase() === name.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 
   * @param {string} param - a parameter that is either the pokemon's Id or it's name 
   * @returns {Pokemon} - returns a pokemon object
   */
  public async getPokemon(param: string): Promise<Pokemon> {
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