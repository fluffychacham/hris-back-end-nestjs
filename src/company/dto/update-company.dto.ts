import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class UpdateCompanyData {
    @ApiPropertyOptional()
    name: string;

    @ApiPropertyOptional()
    description: string;

    @ApiPropertyOptional()
    domain: string;
}

export class UpdateCompanyRO {
    @ApiProperty()
    company: UpdateCompanyData;
}
