import { Get, Post, Body, Put, Delete, Param, Controller, UsePipes, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from 'express';

import { ValidationPipe } from "../shared/pipes/validation.pipe";
import Errors, { IErrors } from "../shared/Errors";
import * as jwt from '../shared/jwt';

import { CreateUserDto, UpdateUserDto, LoginUserDto } from "./dto";

import { UserRO, UserCompanyRO } from "./user.interface";
import { UserService } from "./user.service";
import { UserEntity } from "./user.entity";
import { User } from "./user.decorator";


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
  @ApiResponse({ status: 200, type: UserRO, description: "User updated" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @Put('/')
  async update(@User('id') userId: number, @Body() dto: UpdateUserDto): Promise<UserRO>  {
    return await this.userService.update(userId, dto);
  }

  @ApiOperation({ summary: "Create user and company" })
  @ApiResponse({ status: 201, type: UserCompanyRO, description: "User and company creation successful!" })
  @ApiResponse({ status: 400, type: IErrors, description: "Email and/or company already exists" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @UsePipes(new ValidationPipe())
  @Post('/register')
  async create(@Body() dto: CreateUserDto): Promise<UserCompanyRO>  {
    return this.userService.createUserAndCompany(dto);
  }

  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @Delete('/:id')
  async delete(@Param("id") id) {
    return await this.userService.delete(id);
  }

  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, type: UserCompanyRO,description: 'User logged in'})
  @ApiResponse({ status: 401, description: 'User not authorized' })
  @ApiResponse({ status: 500, description: "Internal Server Error" })
  @UsePipes(new ValidationPipe())
  @Post('/login')
  async login(@Body() dto: LoginUserDto, @Req() request: Request): Promise<UserCompanyRO> {
    // const verified = await this.userService.googleReCaptcha(request);
    // Errors.inputNotValid(!verified, { captcha: 'Captcha not valid' });
    return this.userService.findUserAndCompany(dto);
  }
}
