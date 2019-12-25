import { Controller, Get } from '@nestjs/common';

import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';

@ApiBearerAuth()
@ApiUseTags('Company')
@Controller("company")
export class CompanyController {

    constructor(private readonly companyService: CompanyService){}

    @Get()
    async findAll(){
        return await this.companyService.findAll();
    }
}