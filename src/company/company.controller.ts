import { Controller, Get, Param, Put, Body, Post, UsePipes, ValidationPipe, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags, ApiOperation, ApiResponse, ApiImplicitBody } from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { CompanyRO } from './company.interface';
import { CompanyEntity } from './company.entity';

import { UpdateCompanyRO } from './dto/update-company.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { DeleteResult } from 'typeorm';
import { User } from '../user/user.decorator';

@ApiBearerAuth()
@ApiUseTags('company')
@Controller()
export class CompanyController {

    constructor(private readonly companyService: CompanyService){}

    @ApiOperation({ title: "Get all companies"})
    @ApiResponse({ status: 200, description: "List of companies found" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @Get('companies')
    async findAll(){
        return await this.companyService.findAll();
    }

    @ApiOperation({ title: "Get company by id"})
    @ApiResponse({ status: 200, description: "Company found" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Not found" })
    @Get('company/:id')
    async findById(@Param('id') id: number): Promise<CompanyRO> {
        return await this.companyService.findById(id);
    }

    @ApiOperation({ title: "Update company by id"})
    @ApiResponse({ status: 200, description: "Company update successful" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiResponse({ status: 404, description: "Not found" })
    @Put('company/:id')
    async update(@Param('id') id: number, @Body('company') dto: UpdateCompanyRO): Promise<CompanyEntity>{
        return await this.companyService.update(id, dto);
    }

    @ApiOperation({ title: "Create company"})
    @ApiImplicitBody({ name: 'create company', type: Object })
    @ApiResponse({ status: 201, description: "Create company successful" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @UsePipes(new ValidationPipe())
    @Post('company')
    async create(@User('id') userId: number, @Body('company') dto: CreateCompanyDto): Promise<CompanyRO>{
        return await this.companyService.create(userId, dto);
    }

    @ApiOperation({ title: "Delete company"})
    @ApiResponse({ status: 200, description: "Delete company successful" })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiResponse({ status: 404, description: "Not found" })
    @Delete('company/:id')
    async delete(@Param('id') id: number): Promise<DeleteResult> {
        return await this.companyService.delete(id);
    }
}