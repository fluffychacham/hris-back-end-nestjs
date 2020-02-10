import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, ManyToOne, BeforeInsert } from "typeorm";
import { CompanyEntity } from "../company/company.entity";
import * as crypto from 'crypto';

@Entity("employee")
export class EmployeeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: "" })
    email: string;

    @Column()
    password: string;

    @Column({ default: "" })
    first_name: string;

    @Column({ default: "" })
    last_name: string;

    @Column({ default: "" })
    reports_to: string;

    @Column({ default: "employee" })
    role: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date();
    }

    @BeforeInsert()
    hashPassword() {
        this.password = crypto.createHmac('sha256', this.password).digest('hex');
    }

    @Column({ default: 0 })
    vacation_days: number;

    @Column({ default: 0 })
    education_funds: number;

    @Column({ default: 0 })
    fitness_grant: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    day_to_review: Date;

    @Column({ default: 0 })
    phone_number: number;

    @ManyToOne(
        type => CompanyEntity,
        company => company.employees
    )
    company: CompanyEntity;
}
