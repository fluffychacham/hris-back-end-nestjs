import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Repository, getRepository, DeleteResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { validate } from "class-validator";

import { CompanyEntity } from "./company.entity";
import { UserEntity } from "../user/user.entity";

import { CompanyData, CompanyRO } from "./company.interface";

import { CreateCompanyDto, UpdateCompanyRO } from "./dto";

import Errors from "../shared/Errors";

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(CompanyEntity)
        private readonly companyRepository: Repository<CompanyEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findAll(userId: number): Promise<CompanyRO[]> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ["companies"] });
        return user.companies.map(company => this.buildCompanyRO(company));
    }

    async findOne(companyRO: CompanyData): Promise<CompanyEntity> {
        const findOneOptions = {
            name: companyRO.name
        };
        let toFindOne = await this.companyRepository.findOne(findOneOptions);
        Errors.notFound(!!toFindOne, { company: "Company not found" });
        return toFindOne;
    }

    async findById(userId: number, id: number): Promise<CompanyRO> {
        const company = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.ownerId = :userId", { userId })
            .andWhere("company.id = :id", { id })
            .getOne();
        Errors.notFound(!!company, { company: "Company not found" });
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

        Errors.inputNotValid(!!company, { company: "Company already exists" });

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
        Errors.notFound(!!toUpdate, { company: "Company not found" });
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
        Errors.notFound(!!toDelete, { company: "Company not found" });
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
