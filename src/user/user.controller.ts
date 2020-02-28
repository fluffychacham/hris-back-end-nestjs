import { Get, Post, Body, Put, Delete, Param, Controller, UsePipes } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRO } from "./user.interface";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from "./dto";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { User } from "./user.decorator";
import { ValidationPipe } from "../shared/pipes/validation.pipe";

import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import * as jwt from '../shared/jwt';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: "Get user" })
  @Get('/')
  async findMe(@User('email') email: string): Promise<UserRO> {
    return await this.userService.findByEmail(email);
  }

  @ApiOperation({ summary: "Update user" })
  @Put('/')
  async update(@User('id') userId: number, @Body() dto: UpdateUserDto) {
    return await this.userService.update(userId, dto);
  }

  @ApiOperation({ summary: "Create user" })
  @UsePipes(new ValidationPipe())
  @Post('/register')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiOperation({ summary: "Delete user" })
  @Delete('/:id')
  async delete(@Param("id") id) {
    return await this.userService.delete(id);
  }

  @ApiOperation({ summary: "Login user" })
  @UsePipes(new ValidationPipe())
  @Post('/login')
  async login(@Body() dto: LoginUserDto): Promise<UserRO> {
    const _user = await this.userService.findOne(dto);

    const errors = { User: " not found" };
    if (!_user) throw new HttpException({ errors }, 401);

    const token = await jwt.generateJWT(_user);
    const { email, bio, image } = _user;
    const user = { email, token, bio, image };
    return { user };
  }
}
