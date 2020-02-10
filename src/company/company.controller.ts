import { Controller, Get, Param, Put, Body, Post, UsePipes, ValidationPipe, Delete } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";

import { CompanyService } from "./company.service";
import { CompanyRO } from "./company.interface";
import { CompanyEntity } from "./company.entity";

import { UpdateCompanyRO } from "./dto/update-company.dto";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { DeleteResult } from "typeorm";
import { User } from "../user/user.decorator";

@ApiBearerAuth()
@ApiTags("Company Controller")
@Controller()
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @ApiOperation({ summary: "List all companies" })
    @ApiResponse({ status: 200, type: [CompanyRO], description: "List of companies found" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @Get("companies")
    async findAll(@User("id") userId: number): Promise<CompanyRO[]> {
        return await this.companyService.findAll(userId);
    }

    @ApiOperation({ summary: "Find company by id" })
    @ApiResponse({ status: 200, type: CompanyRO, description: "Company found" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiResponse({ status: 404, description: "Not found" })
    @Get("company/:id")
    async findById(@User("id") userId: number, @Param("id") id: number): Promise<CompanyRO> {
        return await this.companyService.findById(userId, id);
    }

    @ApiOperation({ summary: "Update company by id" })
    @ApiResponse({ status: 200, type: CompanyRO, description: "Company update successful" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiResponse({ status: 404, description: "Not found" })
    @Put("company/:id")
    async update(
        @User("id") userId: number,
        @Param("id") id: number,
        @Body() dto: UpdateCompanyRO
    ): Promise<CompanyRO> {
        return await this.companyService.update(userId, id, dto);
    }

    @ApiOperation({ summary: "Create company" })
    @ApiResponse({ status: 201, type: CompanyRO, description: "Create company successful" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @UsePipes(new ValidationPipe())
    @Post("company")
    async create(@Body() dto: CreateCompanyDto, @User("id") userId: number): Promise<CompanyRO> {
        return await this.companyService.create(userId, dto);
    }

    @ApiOperation({ summary: "Delete company by id" })
    @ApiResponse({ status: 200, type: DeleteResult, description: "Delete company successful" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiResponse({ status: 404, description: "Not found" })
    @Delete("company/:id")
    async delete(@User("id") userId: number, @Param("id") id: number): Promise<DeleteResult> {
        return await this.companyService.delete(userId, id);
    }
}
