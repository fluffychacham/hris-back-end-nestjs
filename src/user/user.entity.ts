import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, OneToMany } from "typeorm";
import { MinLength, MaxLength, Max } from 'class-validator';
import * as crypto from 'crypto';

import { CompanyEntity } from "../company/company.entity";
import { IsEmailValid } from "../shared/validation";

@Entity('user')
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @IsEmailValid()
  @Column()
  email: string;

  @MaxLength(20)
  @Column({default: ''})
  first_name: string;

  @MaxLength(20)
  @Column({default: ''})
  last_name: string;

  @Column({default: 'owner'})
  role: string;

  @Column({default: ''})
  bio: string;

  @Column({default: ''})
  image: string;

  @MinLength(8)
  @MaxLength(20)
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
