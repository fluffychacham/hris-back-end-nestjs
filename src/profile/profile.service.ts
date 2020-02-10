import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { DeepPartial } from "typeorm/common/DeepPartial";
import { ProfileRO, ProfileData } from "./profile.interface";
import { FollowsEntity } from "./follows.entity";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowsEntity)
        private readonly followsRepository: Repository<FollowsEntity>
    ) {}

    async findAll(): Promise<UserEntity[]> {
        return await this.userRepository.find();
    }

    async findOne(options?: DeepPartial<UserEntity>): Promise<ProfileRO> {
        const user = await this.userRepository.findOne(options);
        delete user.id;
        if (user) delete user.password;
        return { profile: user };
    }

    async findProfile(id: number, followingEmail: string): Promise<ProfileRO> {
        const _profile = await this.userRepository.findOne({ email: followingEmail });

        if (!_profile) return;

        let profile: ProfileData = {
            email: _profile.email,
            bio: _profile.bio,
            image: _profile.image
        };

        return { profile };
    }
}
