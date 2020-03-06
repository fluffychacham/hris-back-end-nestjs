import * as crypto from 'crypto';
import { InjectRepository } from "@nestjs/typeorm";

import { Repository, getRepository, DeleteResult } from "typeorm";

import { CompanyEntity } from "../company/company.entity";
import { EmployeeEntity } from "./employee.entity";
import { EmployeeRO } from "./employee.interface";

import CreateEmployeeDto from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { LoginEmployeeDto } from "./dto/login-employee.dto";
import { LoginEmployeeRO } from "./login-employee.interface";
import * as jwt from '../shared/jwt';
import { stringify } from 'querystring';

import { validate } from "class-validator";

import Errors from "../shared/Errors";
import { UserEntity } from '../user/user.entity';

export class EmployeeService {
    constructor(
        @InjectRepository(EmployeeEntity)
        private readonly employeeRespository: Repository<EmployeeEntity>,
        @InjectRepository(CompanyEntity)
        private readonly companyRepository: Repository<CompanyEntity>,
        @InjectRepository(UserEntity)
        private readonly userRespository: Repository<UserEntity>
    ) {}

    private company: CompanyEntity;
    private user: UserEntity;

    async findByEmail(email: string): Promise<EmployeeRO> {
        const employee = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.email = :email", { email })
            .leftJoinAndSelect("employee.company", "company")
            .getOne();
        return this.buildEmployeeRO(employee, employee.company);
    }

    async findAll(userId: number, companyId: number): Promise<EmployeeRO[]> {
        await this.authorizeUser(userId, companyId);
        const company: CompanyEntity = await this.companyRepository.findOne({
            where: { id: companyId, owner: userId },
            relations: ["employees"]
        });
        const employees = company.employees;
        return employees.map(employee => {
            return this.buildEmployeeRO(employee, this.company);
        });
    }

    async findById(userId: number, companyId: number, employeeId: number): Promise<EmployeeRO> {
        await this.authorizeUser(userId, companyId);
        const employee = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.id = :employeeId", { employeeId })
            .andWhere("employee.companyId = :companyId", { companyId })
            .getOne();
        Errors.notFound(!!employee, { employee: "Employee not found" });
        return this.buildEmployeeRO(employee, this.company);
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

        const employee = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.first_name = :first_name", { first_name })
            .andWhere("employee.last_name = :last_name", { last_name })
            .getOne();
        
        if(reports_to !== undefined) {
            this.user = await this.userRespository
                .createQueryBuilder('user')
                .where('user.id = :id', { id: reports_to })
                .getOne()
        } else {
            this.user = await this.userRespository
                .createQueryBuilder('user')
                .where('user.id = :userId', { userId })
                .getOne();
        }

        Errors.inputNotValid(!!employee, { employee: "Employee not valid" });
        Errors.inputNotValid(!!this.user, { employee: "Reports to user not valid" })

        let newEmployee = new EmployeeEntity();
        newEmployee.first_name = first_name;
        newEmployee.last_name = last_name;
        newEmployee.reports_to = this.user;
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
        Errors.inputNotValid(errors.length > 0, { employee: "Employee not valid" });

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
        await this.authorizeUser(userId, companyId);
        let toUpdate = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.id = :id", { id })
            .andWhere("employee.companyId = :companyId", { companyId })
            .getOne();
        Errors.notFound(!!toUpdate, { employee: "Employee not found" });

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
        delete toUpdate.company;

        const updated = Object.assign(toUpdate, dto.employee);

        return this.buildEmployeeRO(await this.employeeRespository.save(updated), this.company);
    }

    async delete(userId: number, companyId: number, employeeId: number): Promise<DeleteResult> {
        await this.authorizeUser(userId, companyId);
        let toDelete = await this.employeeRespository
            .createQueryBuilder("employee")
            .where("employee.id = :employeeId", { employeeId })
            .andWhere("employee.companyId = :companyId", { companyId });
        Errors.notFound(!!toDelete.getOne(), { employee: "Employee not found" });
        return toDelete.delete().execute();
    }

    async loginEmployee(dto: LoginEmployeeDto): Promise<LoginEmployeeRO> {
        const { email, password } = dto.employee;
        const findOptions = { email, password: crypto.createHmac("sha256", password).digest("hex") };
        const employee = await this.employeeRespository.findOne(findOptions);

        Errors.notAuthorized(!!employee, { employee: 'Employee not authorized' });

        const token = jwt.generateJWT(employee);
        const company_name = employee.company.name;
        
        return { employee: { ...employee, token, company_name, reports_to_user_id: employee.reports_to.id } };
    }

    private async authorizeUser(userId: number = 0, companyId: number = 0) {
        const company = await this.companyRepository
            .createQueryBuilder("company")
            .where("company.id = :companyId", { companyId })
            .andWhere("company.ownerId = :userId", { userId })
            .getOne();
        Errors.notAuthorized(!!company, { user: "User not authorized" });
        this.company = company;
        return;
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
            reports_to_user_id: employee.reports_to.id,
            vacation_days: employee.vacation_days,
            education_funds: employee.education_funds,
            phone_number: employee.phone_number,
            fitness_grant: employee.fitness_grant,
            day_to_review: employee.day_to_review
        };

        return { employee: employeeRO };
    }
}
