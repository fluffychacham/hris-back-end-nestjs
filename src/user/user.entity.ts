import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, OneToMany} from "typeorm";
import { IsEmail } from 'class-validator';
import * as crypto from 'crypto';
import { CompanyEntity } from "../company/company.entity";

@Entity('user')
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsEmail()
  email: string;

  @Column({default: 'owner'})
  role: string;

  @Column({default: ''})
  bio: string;

  @Column({default: ''})
  image: string;

  @Column()
  password: string;

  @BeforeInsert()
  hashPassword() {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }

  @OneToMany(type => CompanyEntity, company => company.owner)
  @JoinTable()
  companies: CompanyEntity[];
}
