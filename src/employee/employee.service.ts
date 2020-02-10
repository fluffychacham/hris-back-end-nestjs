import * as crypto from 'crypto';
import { InjectRepository } from "@nestjs/typeorm";
import { EmployeeEntity } from "./employee.entity";
import { Repository, getRepository, DeleteResult } from "typeorm";
import { CompanyEntity } from "../company/company.entity";
import { EmployeeRO } from "./employee.interface";
import { NotFound } from "../shared/errors/404";
import CreateEmployeeDto from "./dto/create-employee.dto";
import { BadRequest } from "../shared/errors/400";
import { validate } from "class-validator";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { LoginEmployeeDto } from "./dto/login-employee.dto";
import { LoginEmployeeRO } from "./login-employee.interface";
import * as jwt from '../shared/jwt';
import { stringify } from 'querystring';

export class EmployeeService {
    constructor(
        @InjectRepository(EmployeeEntity)
        private readonly employeeRespository: Repository<EmployeeEntity>,
        @InjectRepository(CompanyEntity)
        private readonly companyRepository: Repository<CompanyEntity>
    ) {}

    async findAll(userId: number, companyId: number): Promise<EmployeeEntity[]> {
        return (
            await this.companyRepository.findOne({ where: { id: companyId, owner: userId }, relations: ["employees"] })
        ).employees;
    }

    async findById(userId: number, companyId: number, employeeId: number): Promise<EmployeeRO> {
        const company = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.id = :companyId", { companyId })
            .andWhere("company.ownerId = :userId", { userId })
            .getOne();
        NotFound.companyNotFound(!!company);
        const employee = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.id = :employeeId", { employeeId })
            .andWhere("employee.companyId = :companyId", { companyId })
            .getOne();
        NotFound.employeeNotFound(!!employee);
        return this.buildEmployeeRO(employee, company);
    }

    async create(userId: number, companyId: number, dto: CreateEmployeeDto): Promise<EmployeeRO> {
        const {
            first_name,
            last_name,
            reports_to,
            role,
            phone_number,
            vacation_days,
            education_funds,
            fitness_grant,
            day_to_review
        } = dto.employee;

        const employee = await getRepository(EmployeeEntity)
            .createQueryBuilder("employee")
            .where("employee.first_name = :first_name", { first_name })
            .andWhere("employee.last_name = :last_name", { last_name })
            .getOne();

        BadRequest.EmployeeExists(!!employee);

        let newEmployee = new EmployeeEntity();
        newEmployee.first_name = first_name;
        newEmployee.last_name = last_name;
        newEmployee.reports_to = reports_to;
        newEmployee.role = role;
        newEmployee.phone_number = phone_number;
        newEmployee.vacation_days = vacation_days;
        newEmployee.education_funds = education_funds;
        newEmployee.fitness_grant = fitness_grant;
        newEmployee.day_to_review = day_to_review;

        newEmployee.password = stringify(Math.random());

        const company = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.id = :companyId", { companyId })
            .andWhere("company.ownerId = :userId", { userId })
            .leftJoinAndSelect("company.employees", "employee")
            .getOne();

        const errors = await validate(newEmployee);
        BadRequest.EmployeeNotValid(errors.length > 0);

        const savedEmployee = await this.employeeRespository.save(newEmployee);
        if (Array.isArray(company.employees)) {
            company.employees.push(newEmployee);
        } else {
            company.employees = [newEmployee];
        }

        await this.companyRepository.save(company);
        return this.buildEmployeeRO(savedEmployee, company);
    }

    async update(userId: number, companyId: number, id: number, dto: UpdateEmployeeDto): Promise<EmployeeRO> {
        const company = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.id = :companyId", { companyId })
            .andWhere("company.ownerId = :userId", { userId })
            .getOne();
        NotFound.companyNotFound(!!company);
        let toUpdate = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.id = :id", { id })
            .andWhere("employee.companyId = :companyId", { companyId })
            .getOne();
        NotFound.employeeNotFound(!!toUpdate);

        delete toUpdate.first_name;
        delete toUpdate.last_name;
        delete toUpdate.reports_to;
        delete toUpdate.role;
        delete toUpdate.phone_number;
        delete toUpdate.vacation_days;
        delete toUpdate.education_funds;
        delete toUpdate.fitness_grant;
        delete toUpdate.day_to_review;
        delete toUpdate.created;

        let updated = Object.assign(toUpdate, dto.employee);

        return this.buildEmployeeRO(await this.employeeRespository.save(updated), company);
    }

    async delete(userId: number, companyId: number, employeeId: number): Promise<DeleteResult> {
        const company = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.id = :companyId", { companyId })
            .andWhere("company.ownerId = :userId", { userId })
            .getOne();
        NotFound.companyNotFound(!!company);
        let toDelete = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.id = :employeeId", { employeeId })
            .andWhere("employee.companyId = :companyId", { companyId });
        NotFound.employeeNotFound(!!toDelete.getOne());
        return toDelete.delete().execute();
    }

    async loginEmployee(dto: LoginEmployeeDto): Promise<LoginEmployeeRO> {
        const { email, password } = dto.employee;
        const findOptions = { email, password: crypto.createHmac("sha256", password).digest("hex") };
        const employee = await this.employeeRespository.findOne(findOptions);
        const token = jwt.generateJWT(employee);
        const company_name = employee.company.name;
        return { employee: { ...employee, token, company_name } };
    }

    private buildEmployeeRO(employee: EmployeeEntity, company: CompanyEntity) {
        const employeeRO = {
            id: employee.id,
            email: employee.email,
            first_name: employee.first_name,
            last_name: employee.last_name,
            created: employee.created,
            updated: employee.updated,
            role: employee.role,
            company_name: company.name,
            reports_to: employee.reports_to,
            vacation_days: employee.vacation_days,
            education_funds: employee.education_funds,
            phone_number: employee.phone_number,
            fitness_grant: employee.fitness_grant,
            day_to_review: employee.day_to_review
        };

        return { employee: employeeRO };
    }
}
