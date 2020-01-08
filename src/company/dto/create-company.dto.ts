import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class CreateCompanyData {
    @ApiProperty()
    name: string;

    @ApiProperty()
    domain: string;

    @ApiPropertyOptional()
    description: string;
}

export class CreateCompanyDto {
    @ApiProperty()
    readonly company: CreateCompanyData;
}
