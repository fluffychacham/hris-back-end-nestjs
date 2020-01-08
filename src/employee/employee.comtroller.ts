import { ApiBearerAuth, ApiTags, ApiResponse } from "@nestjs/swagger";
import { Controller, Get, Param, Post, Body, Put, Delete, UsePipes, ValidationPipe } from "@nestjs/common";
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

    @ApiResponse({ status: 200, type: [EmployeeRO], description: "Employee found" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 500, description: "Internal Server Error" })
    @Get("company/:companyId/employees")
    async findAll(@User("id") userId: number, @Param("companyId") companyId: number): Promise<EmployeeRO[]> {
        return await this.employeeService.findAll(userId, companyId);
    }

    @ApiResponse({ status: 200, type: EmployeeRO, description: "Employee found" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 500, description: "Internal Server Error" })
    @Get("company/:companyId/employee/:id")
    async findById(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Param("id") id: number
    ): Promise<EmployeeRO> {
        return await this.employeeService.findById(userId, companyId, id);
    }
    @ApiResponse({ status: 201, type: EmployeeRO, description: "Employee created" })
    @ApiResponse({ status: 400, description: "Employee already exists" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 500, description: "Internal Server Error" })
    @UsePipes(new ValidationPipe())
    @Post("company/:companyId/employee")
    async create(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Body() dto: CreateEmployeeDto
    ): Promise<EmployeeRO> {
        return await this.employeeService.create(userId, companyId, dto);
    }

    @ApiResponse({ status: 200, type: EmployeeRO, description: "Employee found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 404, description: "Company not found" })
    @ApiResponse({ status: 500, description: "Internal Server Error" })
    @Put("company/:companyId/employee/:id")
    async update(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Param("id") employeeId: number,
        @Body() dto: UpdateEmployeeDto
    ): Promise<EmployeeRO> {
        return await this.employeeService.update(userId, companyId, employeeId, dto);
    }
    @ApiResponse({ status: 200, type: DeleteResult, description: "Employee deleted" })
    @ApiResponse({ status: 404, description: "Employee not found" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 500, description: "Internal Server Error" })
    @Delete("company/:companyId/employee/:id")
    async delete(
        @User("id") userId: number,
        @Param("companyId") companyId: number,
        @Param("id") id: number
    ): Promise<DeleteResult> {
        return await this.employeeService.delete(userId, companyId, id);
    }
}
