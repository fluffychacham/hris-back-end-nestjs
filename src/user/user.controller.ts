import { Get, Post, Body, Put, Delete, Param, Controller, UsePipes } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRO } from "./user.interface";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from "./dto";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { User } from "./user.decorator";
import { ValidationPipe } from "../shared/pipes/validation.pipe";

import { ApiBearerAuth, ApiTags, ApiResponse } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("User Controller")
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiResponse({ status: 200, description: "User found" })
    @ApiResponse({ status: 404, description: "User email not found (email from token)" })
    @Get("user")
    async findMe(@User("email") email: string): Promise<UserRO> {
        return await this.userService.findByEmail(email);
    }

    @ApiResponse({ status: 200, description: "User found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "User not found" })
    @Put("user")
    async update(@User("id") userId: number, @Body() userData: UpdateUserDto) {
        return await this.userService.update(userId, userData);
    }

    @ApiResponse({ status: 201, description: "User created" })
    @ApiResponse({ status: 400, description: "User already exists" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "User not found" })
    @UsePipes(new ValidationPipe())
    @Post("users")
    async create(@Body() userData: CreateUserDto) {
        return this.userService.create(userData);
    }

    @ApiResponse({ status: 200, description: "User found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "User not found" })
    @Delete("users/:email")
    async delete(@Param("email") params: string) {
        return await this.userService.delete(params);
    }

    @ApiResponse({ status: 200, description: "User found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "User not found" })
    @UsePipes(new ValidationPipe())
    @Post("users/login")
    async login(@Body() loginUserDto: LoginUserDto): Promise<UserRO> {
        return await this.userService.findOne(loginUserDto);
    }
}
