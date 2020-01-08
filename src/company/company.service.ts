import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, getRepository, DeleteResult } from "typeorm";

import { validate } from "class-validator";

import { CompanyEntity } from "./company.entity";
import { UserEntity } from "../user/user.entity";

import { CompanyData, CompanyRO } from "./company.interface";

import { CreateCompanyDto, UpdateCompanyRO } from "./dto";
import { BadRequest } from "../shared/errors/400";
import { NotFound } from "../shared/errors/404";

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(CompanyEntity)
        private readonly companyRepository: Repository<CompanyEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findAll(userId: number): Promise<CompanyEntity[]> {
        return (await this.userRepository.findOne({ where: { id: userId }, relations: ["companies"] })).companies;
    }

    async findOne(companyRO: CompanyData): Promise<CompanyEntity> {
        const findOneOptions = {
            name: companyRO.name
        };
        let toFindOne = await this.companyRepository.findOne(findOneOptions);
        NotFound.companyNotFound(!!toFindOne);
        return toFindOne;
    }

    async findById(userId: number, id: number): Promise<CompanyRO> {
        const company = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.ownerId = :userId", { userId })
            .andWhere("company.id = :id", { id })
            .getOne();
        NotFound.companyNotFound(!!company);
        return this.buildCompanyRO(company);
    }

    async findByName(name: string): Promise<CompanyRO> {
        const company = await this.companyRepository.findOne({ name });
        return this.buildCompanyRO(company);
    }

    async create(id: number, dto: CreateCompanyDto): Promise<CompanyRO> {
        const { name, description, domain } = dto.company;

        // Check if company name exists
        const qb = await getRepository(CompanyEntity)
            .createQueryBuilder("company")
            .where("company.name = :name", { name });

        const company = await qb.getOne();

        BadRequest.CompanyExists(!!company);

        let newCompany = new CompanyEntity();
        newCompany.name = name;
        newCompany.description = description;
        newCompany.domain = domain;

        const owner = await this.userRepository.findOne({ where: { id }, relations: ["companies"] });

        const errors = await validate(newCompany);
        if (errors.length > 0) {
            const _errors = { company: "Company is not valid" };
            throw new HttpException({ message: "Inpupt validation failed", _errors }, HttpStatus.BAD_REQUEST);
        } else {
            const savedCompany = await this.companyRepository.save(newCompany);
            if (Array.isArray(owner.companies)) {
                owner.companies.push(newCompany);
            } else {
                owner.companies = [newCompany];
            }
            await this.userRepository.save(owner);
            return this.buildCompanyRO(savedCompany);
        }
    }

    async update(userId: number, id: number, dto: UpdateCompanyRO): Promise<CompanyRO> {
        let toUpdate = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.ownerId = :userId", { userId })
            .andWhere("company.id = :id", { id })
            .getOne();
        NotFound.companyNotFound(!!toUpdate);
        delete toUpdate.name;
        delete toUpdate.description;
        delete toUpdate.domain;

        let updated = Object.assign(toUpdate, dto.company);
        return this.buildCompanyRO(await this.companyRepository.save(updated));
    }

    async delete(userId: number, id: number): Promise<DeleteResult> {
        let toDelete = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.ownerId = :userId", { userId })
            .andWhere("company.id = :id", { id });
        NotFound.companyNotFound(!!toDelete);
        return toDelete.delete().execute();
    }

    private buildCompanyRO(company: CompanyEntity) {
        const companyRO = {
            id: company.id,
            name: company.name,
            description: company.description,
            domain: company.domain,
            created: company.created,
            updated: company.updated
        };

        return { company: companyRO };
    }
}
