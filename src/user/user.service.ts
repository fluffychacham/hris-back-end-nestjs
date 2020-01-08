import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, getRepository, DeleteResult } from "typeorm";
import { UserEntity } from "./user.entity";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./dto";
const jwt = require("jsonwebtoken");
import { SECRET } from "../config";
import { UserRO } from "./user.interface";
import { validate } from "class-validator";
import * as crypto from "crypto";
import Errors from "../shared/Errors";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findAll(): Promise<UserEntity[]> {
        return await this.userRepository.find();
    }

    async findOne(loginUserDto: LoginUserDto): Promise<UserRO> {
        const { email, password } = loginUserDto.user;
        const findOneOptions = {
            email: email,
            password: crypto.createHmac("sha256", password).digest("hex")
        };

        const user = await this.userRepository.findOne(findOneOptions);

        Errors.notFound(!!user, { user: "User not found" });

        return this.buildUserRO(user);
    }

    async create(dto: CreateUserDto): Promise<UserRO> {
        // check uniqueness of username/email
        const { username, email, password } = dto.user;
        const qb = await getRepository(UserEntity)
            .createQueryBuilder("user")
            .where("user.username = :username", { username })
            .orWhere("user.email = :email", { email });

        const user = await qb.getOne();

        Errors.inputNotValid(!!user, { username: "Username and email must be unique." });

        // create new user
        let newUser = new UserEntity();
        newUser.username = username;
        newUser.email = email;
        newUser.password = password;
        newUser.articles = [];

        const errors = await validate(newUser);

        Errors.inputNotValid(errors.length > 0, { user: "User not valid" });

        const savedUser = await this.userRepository.save(newUser);
        return this.buildUserRO(savedUser);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserRO> {
        let toUpdate = await this.userRepository.findOne(id);
        delete toUpdate.password;
        delete toUpdate.favorites;

        let updated = Object.assign(toUpdate, dto);
        return this.buildUserRO(await this.userRepository.save(updated));
    }

    async delete(email: string): Promise<DeleteResult> {
        return await this.userRepository.delete({ email: email });
    }

    async findById(id: number): Promise<UserRO> {
        const user = await this.userRepository.findOne(id);

        Errors.notAuthorized(!!user, { user: "User not found" });

        return this.buildUserRO(user);
    }

    async findByEmail(email: string): Promise<UserRO> {
        const user = await this.userRepository.findOne({ email: email });
        return this.buildUserRO(user);
    }

    public generateJWT(user: UserEntity) {
        let today = new Date();
        let exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                exp: exp.getTime() / 1000
            },
            SECRET
        );
    }

    private buildUserRO(user: UserEntity) {
        const userRO = {
            username: user.username,
            email: user.email,
            bio: user.bio,
            token: this.generateJWT(user),
            image: user.image
        };

        return { user: userRO };
    }
}
