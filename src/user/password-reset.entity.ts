import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity('password-reset')
export class PasswordEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created: Date;

    @Column({ default: 0 })
    user_id: number

    @Column({ default: '' })
    password_confirm_code: string;
}