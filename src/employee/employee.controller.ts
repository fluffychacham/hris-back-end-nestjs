import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { Controller, Get, Param, Post, Body, Put, Delete } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { EmployeeRO } from "./employee.interface";
import { User } from "../user/user.decorator";
import CreateEmployeeDto from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { DeleteResult } from "typeorm";
import { LoginEmployeeDto } from "./dto/login-employee.dto";
import { LoginEmployeeRO } from "./login-employee.interface";

@ApiBearerAuth()
@ApiTags("Employee Controller")
@Controller()
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @ApiOperation({ summary: "Find employee by id" })
    @ApiResponse({ status: 200, type: EmployeeRO, description: "Employee found" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @Get("company/:companyId/employee/:id")
    async findById(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Param("id") id: number
    ): Promise<EmployeeRO> {
        return await this.employeeService.findById(userId, companyId, id);
    }

    @ApiOperation({ summary: "Create employee" })
    @ApiResponse({ status: 201, type: EmployeeRO, description: "Employee created" })
    @ApiResponse({ status: 400, description: "Employee already exists" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @Post("company/:companyId/employee")
    async create(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Body() dto: CreateEmployeeDto
    ): Promise<EmployeeRO> {
        return await this.employeeService.create(userId, companyId, dto);
    }

    @ApiOperation({ summary: "Update employee" })
    @ApiResponse({ status: 200, type: EmployeeRO, description: "Employee found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 404, description: "Company not found" })
    @Put("company/:companyId/employee/:id")
    async update(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Param("id") employeeId: number,
        @Body() dto: UpdateEmployeeDto
    ): Promise<EmployeeRO> {
        return await this.employeeService.update(userId, companyId, employeeId, dto);
    }

    @ApiOperation({ summary: "Delete employee by id" })
    @ApiResponse({ status: 200, type: DeleteResult, description: "Employee found" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @Delete("company/:companyId/employee/:id")
    async delete(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Param("id") id: number
    ): Promise<DeleteResult> {
        return await this.employeeService.delete(userId, companyId, id);
    }

    @ApiOperation({ summary: "Login employee" })
    @ApiResponse({ status: 200, type: LoginEmployeeRO,  description: "Employee found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @Post("company/:companyId/employee/login")
    async loginEmployee(@Body() dto: LoginEmployeeDto): Promise<LoginEmployeeRO> {
        return this.employeeService.loginEmployee(dto);
    }
}
