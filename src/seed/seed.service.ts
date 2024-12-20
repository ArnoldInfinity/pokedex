import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { PokeAPIResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) { }

  private readonly axios: AxiosInstance = axios

  async executeSeed() {
    try {
      const { data } = await this.axios.get<PokeAPIResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')
      if (!data || !data.results) throw new NotFoundException('PokeAPI response not found');

      const pokemosToInsert: { name: string, no: number }[] = [];

      data.results.forEach(({ name, url }) => {
        const segments = url.split('/');
        const no = +segments[segments.length - 2];
        pokemosToInsert.push({ name, no });
      });

      await this.pokemonModel.insertMany(pokemosToInsert);

      return 'Database populated';
    } catch (error) {
      throw new InternalServerErrorException("cant populate database - check server logs");
    }
  }
}
