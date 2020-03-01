import { Get, Post, Body, Put, Delete, Param, Controller, UsePipes, Inject, forwardRef } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRO, UserRegisterRO } from "./user.interface";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from "./dto";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { User } from "./user.decorator";
import { ValidationPipe } from "../shared/pipes/validation.pipe";

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

import * as jwt from '../shared/jwt';
import { UserEntity } from "./user.entity";
import { IErrors } from "../shared/Errors";

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: "Get user" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @Get('/')
  async findMe(@User('email') email: string): Promise<UserRO> {
    return await this.userService.findByEmail(email);
  }

  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @Put('/')
  async update(@User('id') userId: number, @Body() dto: UpdateUserDto): Promise<UserEntity>  {
    return await this.userService.update(userId, dto);
  }

  @ApiOperation({ summary: "Create user and company" })
  @ApiResponse({ status: 201, type: UserRegisterRO, description: "User and company creation successful!" })
  @ApiResponse({ status: 400, type: IErrors, description: "Email and/or company already exists" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @UsePipes(new ValidationPipe())
  @Post('/register')
  async create(@Body() dto: CreateUserDto): Promise<UserRegisterRO>  {
    return this.userService.createUserAndCompany(dto);
  }

  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @Delete('/:id')
  async delete(@Param("id") id) {
    return await this.userService.delete(id);
  }

  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @UsePipes(new ValidationPipe())
  @Post('/login')
  async login(@Body() dto: LoginUserDto): Promise<UserRO> {
    const _user = await this.userService.findOne(dto);

    const errors = { User: " not found" };
    if (!_user) throw new HttpException({ errors }, 401);

    const token = await jwt.generateJWT(_user);
    const { id, email, bio, image } = _user;
    const user = { id, email, token, bio, image };
    return { user };
  }
}
