import { Get, Post, Delete, Param, Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileRO } from './profile.interface';
import { User } from '../user/user.decorator';

<<<<<<< HEAD
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
=======
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags('profiles')
>>>>>>> 635d760783eac8ac3563eb56146f0849ac448b72
@Controller('profiles')
export class ProfileController {

  constructor(private readonly profileService: ProfileService) {}

  @Get(':email')
  async getProfile(@User('id') userId: number, @Param('email') email: string): Promise<ProfileRO> {
    return await this.profileService.findProfile(userId, email);
  }

}