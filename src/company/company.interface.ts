import { ApiProperty } from "@nestjs/swagger";

export class CompanyData {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    domain: string;

    @ApiProperty()
    created: Date;
    
    @ApiProperty()
    updated: Date;
}

export class CompanyRO {
    @ApiProperty()
    company: CompanyData;
}
