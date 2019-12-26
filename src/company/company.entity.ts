import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, ManyToOne } from "typeorm";
import { UserEntity } from "../user/user.entity";


@Entity('company')
export class CompanyEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({default: ''})
    description: string;

    @Column({type: 'timestamp', default : () => "CURRENT_TIMESTAMP"})
    created: Date;

    @Column({type: 'timestamp', default : () => "CURRENT_TIMESTAMP"})
    updated: Date;

    @BeforeUpdate()
    updateTimestamp(){
        this.updated = new Date;
    }

    @ManyToOne(type => UserEntity, user => user.companies)
    owner: UserEntity;

}