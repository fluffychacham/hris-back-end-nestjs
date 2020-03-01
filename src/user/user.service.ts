import { Injectable, HttpService, HttpStatus } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { validate } from 'class-validator';
import { Request } from 'express';
import * as crypto from 'crypto';

import { CompanyEntity } from '../company/company.entity';

import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./dto";
import { GOOGLE_CAPTCHA_SECRET } from '../config';
import { UserEntity } from './user.entity';
import { UserRO } from './user.interface';
import Errors from '../shared/Errors';
import * as jwt from '../shared/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly httpService: HttpService
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne(loginUserDto: LoginUserDto): Promise<UserRO> {
    const { email, password } = loginUserDto.user;
    const findOneOptions = {
      email: email,
      password: crypto.createHmac('sha256', password).digest('hex'),
    };

    const user = await this.userRepository.findOne(findOneOptions)
    return this.buildUserRO(user);
  }

  async create(dto: CreateUserDto): Promise<UserRO> {

    // check uniqueness of username/email
    const { email, password } = dto.user;
    const qb = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .orWhere('user.email = :email', { email });

    const user = await qb.getOne();

    Errors.inputNotValid(!!user, { email: "Email already exists" });

    // create new user
    let newUser = new UserEntity();
    newUser.email = email;
    newUser.password = password;
    newUser.companies = [];

    const user_error = await validate(newUser);
    Errors.inputNotValid(user_error.length > 0, { email: "User input is not valid." })

    const savedUser = await this.userRepository.save(newUser);
    return this.buildUserRO(savedUser);

  }

  async createUserAndCompany(dto: CreateUserDto) {
    const { email, password } = dto.user;
    const { name, description, domain } = dto.company;

    // check uniqueness of username/email & company name
    const qb_user = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .orWhere('user.email = :email', { email });
    const qb_company = await getRepository(CompanyEntity)
      .createQueryBuilder("company")
      .where("company.name = :name", { name });

    const user = await qb_user.getOne();
    const company = await qb_company.getOne();

    const dataExistsInputError = new Errors(HttpStatus.BAD_REQUEST);
    dataExistsInputError.pushErrorMessage(!!user, { email: "Email already exists" });
    dataExistsInputError.pushErrorMessage(!!company, { company: "Company already exists" });
    dataExistsInputError.showErrorMessages();

    // create new user
    let newUser = new UserEntity();
    newUser.email = email;
    newUser.password = password;
    newUser.companies = [];

    // create new company
    let newCompany = new CompanyEntity();
    newCompany.name = name;
    newCompany.description = description;
    newCompany.domain = domain;

    const user_error = await validate(newUser);
    const company_error = await validate(newCompany);

    const dataInvalidError = new Errors(HttpStatus.BAD_REQUEST);
    if(user_error.length > 0) {
      user_error.map(u => {
        dataInvalidError.pushErrorMessage(u.property === "email", { email: 'Email is not valid' });
        const password_constraints = u.constraints.minLength || u.constraints.maxLength || "";
        dataInvalidError.pushErrorMessage(u.property === "password", {
            password: password_constraints.charAt(0).toUpperCase() + password_constraints.slice(1)
        });
      });
    }
    dataInvalidError.pushErrorMessage(company_error.length > 0, { company: "Company is not valid" })
    dataInvalidError.showErrorMessages();

    const savedUser = await this.userRepository.save(newUser);
    const owner = await this.userRepository.findOne({ where: { id: savedUser.id }, relations: ["companies"] });
    const savedCompany = await this.companyRepository.save(newCompany);
    if (Array.isArray(owner.companies)) {
        owner.companies.push(newCompany);
    } else {
        owner.companies = [newCompany];
    }
    await this.userRepository.save(owner);

    return this.buildUserAndCompanyRO(savedUser, savedCompany);

  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    let toUpdate = await this.userRepository.findOne(id);
    
    Errors.notFound(!!!toUpdate, { user: 'User not found' });

    delete toUpdate.password;

    let updated = Object.assign(toUpdate, dto.user);
    return await this.userRepository.save(updated);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete({ id: id });
  }

  async findById(id: number): Promise<UserRO>{
    const user = await this.userRepository.findOne(id);

    Errors.notFound(!!user, { user: 'User not found' });

    return this.buildUserRO(user);
  }

  async findByEmail(email: string): Promise<UserRO>{
    const user = await this.userRepository.findOne({ email: email });
    Errors.notFound(!!user, { user: 'User not found' })
    return this.buildUserRO(user);
  }

  async googleReCaptcha(request: Request): Promise<boolean> {
    const google_captcha_url = 'https://www.google.com/recaptcha/api';
    const site_verify_url = '/siteverify?secret=' + GOOGLE_CAPTCHA_SECRET;
    const captcha_response = '&response=' + request.body['g-recaptcha-response'];
    const remote_ip = '&remoteip=' + request.connection.remoteAddress;

    const verify_url = google_captcha_url + site_verify_url + captcha_response + remote_ip;

    const response = await this.httpService.get(verify_url).toPromise();
    if(response && response.data) return response.data.success;
    return false;
  }

  private buildUserRO(user: UserEntity) {
    const userRO = {
      id: user.id,
      email: user.email,
      bio: user.bio,
      token: jwt.generateJWT(user),
      image: user.image,
      role: user.role
    };

    return { user: userRO };
  }

  private buildUserAndCompanyRO(user: UserEntity, company: CompanyEntity) {
    const userRO = {
      id: user.id,
      email: user.email,
      bio: user.bio,
      token: jwt.generateJWT(user),
      image: user.image,
      role: user.role
    }
    const companyRO = {
      id: company.id,
      name: company.name,
      domain: company.domain,
      description: company.description,
      created: company.created,
      updated: company.updated
    }

    return { user: userRO, company: companyRO }
  }
}