export interface Pokemon {
  id: number,
  name: string,
  sprites: {
    front_default: string,
  },
  stats: {
    att: number,
    def: number,
    hp: number,
  },
  moves: string[],
  nextEvolution: string,
}

export interface PokemonLite extends Omit<Pokemon, 'stats' | 'moves' | 'nextEvolution'> {}