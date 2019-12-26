import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, getRepository, DeleteResult } from "typeorm";

import { validate } from "class-validator";

import { CompanyEntity } from "./company.entity";
import { CompanyData, CompanyRO } from "./company.interface";

import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyRO } from "./dto/update-company.dto";
import { UserEntity } from "../user/user.entity";

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(CompanyEntity) 
        private readonly companyRepository: Repository<CompanyEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findAll(): Promise<CompanyEntity[]>{
        return await this.companyRepository.find();
    }

    async findOne(companyRO: CompanyData ): Promise<CompanyEntity>{
        const findOneOptions = {
            name: companyRO.name
        }

        return await this.companyRepository.findOne(findOneOptions);
    }

    async findById(id: number): Promise<CompanyRO> {
        const company = await this.companyRepository.findOne(id);
        if(!company) {
            const errors = {company: 'Company not found'};
            throw new HttpException({errors}, HttpStatus.NOT_FOUND)
        }

        return this.buildCompanyRO(company);
    }

    async findByName(name: string): Promise<CompanyRO> {
        const company = await this.companyRepository.findOne({name});
        return this.buildCompanyRO(company);
    }

    async create(id :number, dto: CreateCompanyDto) : Promise<CompanyRO>{
        const { name, description } = dto;

        // Check if company name exists
        const qb = await getRepository(CompanyEntity)
            .createQueryBuilder('company')
            .where('company.name = :name', {name});
        
        const company = await qb.getOne();

        if(company){
            const errors = {company: "Company already exists"}
            throw new HttpException({message: "Input validation failed", errors}, HttpStatus.BAD_REQUEST);
        }

        let newCompany = new CompanyEntity();
        newCompany.name = name;
        newCompany.description = description;

        const owner = await this.userRepository.findOne({ where: {id}, relations: ['companies'] });

        const errors = await validate(newCompany);
        if(errors.length > 0){
            const _errors = {company: "Company is not valid"};
            throw new HttpException({message: "Inpupt validation failed", _errors}, HttpStatus.BAD_REQUEST);
        } else {
            const savedCompany = await this.companyRepository.save(newCompany);
            if(Array.isArray(owner.companies)) {
                owner.companies.push(newCompany);
            } else {
                owner.companies = [newCompany];
            }
            await this.userRepository.save(owner);
            return this.buildCompanyRO(savedCompany);
        }
    }

    async update (id: number, dto: UpdateCompanyRO): Promise<CompanyEntity> {
        let toUpdate = await this.companyRepository.findOne(id);
        delete toUpdate.name;
        delete toUpdate.description;

        let updated = Object.assign(toUpdate, dto);
        return await this.companyRepository.save(updated);
    }

    async delete (id: number): Promise<DeleteResult> {
        return await this.companyRepository.delete({id});
    }

    private buildCompanyRO(company: CompanyEntity){
        const companyRO = {
            id: company.id,
            name: company.name,
            description: company.description,
            created: company.created,
            updated: company.updated
        }

        return {company: companyRO};
    }
}
