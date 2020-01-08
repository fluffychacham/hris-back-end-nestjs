import { ApiBearerAuth, ApiTags, ApiResponse } from "@nestjs/swagger";
import { Controller, Get, Param, Post, Body, Put, Delete } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { EmployeeRO } from "./employee.interface";
import { User } from "../user/user.decorator";
import CreateEmployeeDto from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { DeleteResult } from "typeorm";

@ApiBearerAuth()
@ApiTags("Employee Controller")
@Controller()
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @ApiResponse({ status: 200, description: "Employee found" })
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
    @ApiResponse({ status: 201, description: "Employee created" })
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

    @ApiResponse({ status: 200, description: "Employee found" })
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
    @ApiResponse({ status: 200, description: "Employee found" })
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
}
