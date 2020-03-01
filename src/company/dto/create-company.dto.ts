import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCompanyData {
    @ApiProperty()
    name: string;

    @ApiProperty()
    domain: string;

    @ApiPropertyOptional()
    description: string;
}

export class CreateCompanyDto {
    @ApiProperty()
    company: CreateCompanyData;
}
