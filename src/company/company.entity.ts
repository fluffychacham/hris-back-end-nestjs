import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, ManyToOne, OneToMany } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { EmployeeEntity } from "../employee/employee.entity";

@Entity("company")
export class CompanyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: "" })
    description: string;

    @Column({ default: "" })
    domain: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date();
    }

    @ManyToOne(
        type => UserEntity,
        user => user.companies
    )
    owner: UserEntity;

    @OneToMany(
        type => EmployeeEntity,
        employee => employee.company
    )
    employees: EmployeeEntity[];
}
