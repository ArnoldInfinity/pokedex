import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch (error) {

      if (error.code === 11000) {
        throw new BadRequestException(`Pokemon already exists ${JSON.stringify(error.keyValue)}`);
      }
      throw new InternalServerErrorException("cant create pokemon - check server logs");
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    let pokemon: Pokemon;
    try {
      if (!isNaN(+id)) pokemon = await this.pokemonModel.findOne({ no: +id });
      if (!pokemon && isValidObjectId(id)) pokemon = await this.pokemonModel.findById({ _id: id });
      if (!pokemon) pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase().trim() });

      if (!pokemon) throw new NotFoundException(`Pokemon ${id} not found`);
      return pokemon;
    } catch (error) {
      throw new InternalServerErrorException("cant find pokemon - check server logs");
    }
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);
    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase()
    if (updatePokemonDto.no && pokemon.no !== updatePokemonDto.no) throw new BadRequestException(`Pokemon with no ${pokemon.no} already exists`);

    try {
      await pokemon.updateOne(updatePokemonDto, {new: true});
      return {...pokemon.toJSON(), ...updatePokemonDto};

    } catch (error) {
      throw new InternalServerErrorException("cant update pokemon - check server logs");
    }
  }

  async remove(id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if (deletedCount === 0) throw new NotFoundException(`Pokemon ${id} not found`);
    return;
  }
}
