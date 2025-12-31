export interface PokemonLong {
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

export interface Pokemon extends Omit<PokemonLong, 'stats' | 'moves' | 'nextEvolution'> {}