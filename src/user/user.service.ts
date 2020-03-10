import { Injectable, HttpService, HttpStatus } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { validate } from 'class-validator';
import { Request } from 'express';
import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';

import { CompanyEntity } from '../company/company.entity';

import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./dto";
import { GOOGLE_CAPTCHA_SECRET } from '../config';
import { UserEntity } from './user.entity';
import { UserRO, UserCompanyRO } from './user.interface';
import Errors from '../shared/Errors';
import * as jwt from '../shared/jwt';
import { CompanyData } from '../company/company.interface';
import { PasswordResetDto } from './dto/password-reset.dto';
import { PasswordEntity } from './password-reset.entity';

export class TEMP_PasswordReset {
  user: {
    password_code: string;
  }
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly httpService: HttpService,
    @InjectRepository(PasswordEntity)
    private readonly passwordRepository: Repository<PasswordEntity>
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findUserAndCompany(loginUserDto: LoginUserDto): Promise<UserCompanyRO> {
    // Check and get user
    const { email, password } = loginUserDto.user;
    const user = await this.userRepository.findOne({
      email,
      password: crypto.createHmac('sha256', password).digest('hex')
    });
    Errors.notAuthorized(!!user, { user: 'User not authorized'});
    // Check and get company
    const company = await this.companyRepository.findOne({ owner: { id: user.id } });
    Errors.notFound(!!company, { company: 'Company not found' });

    return this.buildUserAndCompanyRO(user, company);
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
        dataInvalidError.pushErrorMessage(u.property === "email", { email: u.constraints.emailValidator });
        const password_constraints = u.constraints.minLength || u.constraints.maxLength || "";
        dataInvalidError.pushErrorMessage(u.property === "password", {
            password: password_constraints.charAt(0).toUpperCase() + password_constraints.slice(1)
        });
      });
    }
    if(company_error.length > 0) {
      company_error.map(c => {
        const name_constraints = c.constraints.minLength || c.constraints.maxLength || "";
        dataInvalidError.pushErrorMessage(c.property === "name", {
            company_name: name_constraints.charAt(0).toUpperCase() + name_constraints.slice(1)
        });
        dataInvalidError.pushErrorMessage(c.property === "domain", { company_domain: 'Domain not valid' })
      })
    }
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

  async update(id: number, dto: UpdateUserDto): Promise<UserRO> {
    const toUpdate = await this.userRepository.findOne(id);
    
    Errors.notFound(!!!toUpdate, { user: 'User not found' });

    delete toUpdate.password;

    const updated = await this.userRepository.save(Object.assign(toUpdate, dto.user));
    return this.buildUserRO(updated);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete({ id: id });
  }

  async findById(id: number): Promise<UserRO>{
    const user = await this.userRepository.findOne(id);

    Errors.notFound(!!user, { user: 'User not found' });

    return this.buildUserRO(user);
  }

  async findByEmail(email: string): Promise<UserCompanyRO>{
    const user = await this.userRepository.findOne({ email: email });
    Errors.notFound(!!user, { user: 'User not found' });

    const company = await this.companyRepository.findOne({ owner: { id: user.id } })
    Errors.notFound(!!company, { company: 'Company not found' });
    return this.buildUserAndCompanyRO(user, company);
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

  async passwordReset(dto: PasswordResetDto): Promise<UserCompanyRO> {
    const { password_confirm_code, password } = dto.user;

    const passwordResetRepository = await this.passwordRepository
      .createQueryBuilder('password-reset')
      .where('password_confirm_code = :password_confirm_code', { password_confirm_code });
    const passwordReset = await passwordResetRepository.getOne();
    Errors.inputNotValid(!!!passwordReset, { user: 'Password reset code not found' });

    const createdPasswordReset = new Date(passwordReset.created);
    const timeNow = new Date();
    Errors.inputNotValid(!this.calcTimeExpiry(createdPasswordReset, timeNow), { user: 'Password reset code expired' });

    const user = await this.userRepository.findOne(passwordReset.user_id);
    Errors.notFound(!!user, { user: 'User not found'});

    const _password = crypto.createHmac('sha256', password).digest('hex');

    const updatedUserPassword = await this.userRepository.save(Object.assign(user, { password: _password, password_updated: new Date() }));
    Errors.notAuthorized(!!updatedUserPassword, { user: 'User not authorized' });

    const passwordDelete = await passwordResetRepository.delete().execute();
    if(passwordDelete.affected === 0) return;

    const company = await this.companyRepository.findOne({ owner: { id: user.id } });
    Errors.notFound(!!company, { company: 'Company not found'});
    return this.buildUserAndCompanyRO(updatedUserPassword, company);
  }

  // TODO Remove temp return object when send email is ready
  async passwordResetRequest(email: string): Promise<TEMP_PasswordReset> {
    const user = await this.userRepository.findOne({ email });
    Errors.notAuthorized(!!user, { user: 'User not authorized' });

    // Create password reset row
    let newPasswordReset = new PasswordEntity()
    newPasswordReset.user_id = user.id;
    newPasswordReset.password_confirm_code = uuid();
    const passwordReset = await this.passwordRepository.save(newPasswordReset);

    return {
      user: {
        password_code: passwordReset.password_confirm_code
      }
    };
  }

  // If time expired, return true else, false 
  private calcTimeExpiry(date1: Date, date2: Date): boolean {
    const time1 = new Date(date1).getTime();
    const time2 = new Date(date2).getTime();
    const expiry_time = 14400000; // 4 hours
    return (time1 + expiry_time) > time2;
  }

  private buildUserRO(u: UserEntity): UserRO {
    return {
      user: {
        id: u.id,
        email: u.email,
        bio: u.bio,
        token: jwt.generateJWT(u),
        image: u.image,
        role: u.role
      }
    } 
  }

  private buildUserAndCompanyRO(u: UserEntity, c: CompanyEntity): UserCompanyRO {
    const { user } = this.buildUserRO(u);
    const companyRO: CompanyData = {
      id: c.id,
      name: c.name,
      domain: c.domain,
      description: c.description,
      created: c.created,
      updated: c.updated
    }
    return { user, company: companyRO }
  }
}