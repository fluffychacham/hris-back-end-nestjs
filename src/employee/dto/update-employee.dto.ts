import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class UpdateEmployeeData {
    @ApiPropertyOptional()
    first_name: string;

    @ApiPropertyOptional()
    last_name: string;

    @ApiPropertyOptional()
    reports_to: string;

    @ApiPropertyOptional()
    role: string;

    @ApiPropertyOptional()
    phone_number: number;

    @ApiPropertyOptional()
    vacation_days: number;

    @ApiPropertyOptional()
    education_funds: number;

    @ApiPropertyOptional()
    fitness_grant: number;

    @ApiPropertyOptional()
    day_to_review: Date;
}

export class UpdateEmployeeDto {
    @ApiProperty()
    employee: UpdateEmployeeData;
}
