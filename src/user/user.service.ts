import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { UserEntity } from './user.entity';
import {CreateUserDto, LoginUserDto, UpdateUserDto} from './dto';
import { UserRO } from './user.interface';
import { validate } from 'class-validator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as jwt from '../shared/jwt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { email, password } = loginUserDto.user;
    const findOneOptions = {
      email: email,
      password: crypto.createHmac('sha256', password).digest('hex'),
    };

    return await this.userRepository.findOne(findOneOptions);
  }

  async create(dto: CreateUserDto): Promise<UserRO> {

    // check uniqueness of username/email
    const { email, password } = dto.user;
    const qb = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .orWhere('user.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      const errors = { email: "Email must be unique." };
      throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);

    }

    // create new user
    let newUser = new UserEntity();
    newUser.email = email;
    newUser.password = password;
    newUser.companies = [];

    const errors = await validate(newUser);
    if (errors.length > 0) {
      const _errors = { email: "Userinput is not valid." };
      throw new HttpException({ message: "Input data validation failed", _errors }, HttpStatus.BAD_REQUEST);

    } else {
      const savedUser = await this.userRepository.save(newUser);
      return this.buildUserRO(savedUser);
    }

  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    let toUpdate = await this.userRepository.findOne(id);
    delete toUpdate.password;

    let updated = Object.assign(toUpdate, dto.user);
    return await this.userRepository.save(updated);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete({ id: id });
  }

  async findById(id: number): Promise<UserRO>{
    const user = await this.userRepository.findOne(id);

    if (!user) {
      const errors = {User: ' not found'};
      throw new HttpException({errors}, 401);
    };

    return this.buildUserRO(user);
  }

  async findByEmail(email: string): Promise<UserRO>{
    const user = await this.userRepository.findOne({email: email});
    return this.buildUserRO(user);
  }

  private buildUserRO(user: UserEntity) {
    const userRO = {
      email: user.email,
      bio: user.bio,
      token: jwt.generateJWT(user),
      image: user.image
    };

    return { user: userRO };
  }
}