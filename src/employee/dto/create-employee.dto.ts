import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class CreateEmployeeData {
    @ApiProperty()
    @IsNotEmpty()
    readonly first_name: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly last_name: string;

    @ApiPropertyOptional()
    readonly reports_to: string;

    @ApiPropertyOptional()
    readonly role: string;
    @ApiPropertyOptional()
    readonly phone_number: number;

    @ApiPropertyOptional()
    readonly vacation_days: number;

    @ApiPropertyOptional()
    readonly education_funds: number;

    @ApiPropertyOptional()
    readonly fitness_grant: number;

    @ApiPropertyOptional()
    readonly day_to_review: Date;
}

export default class CreateEmployeeDto {
    @ApiProperty()
    employee: CreateEmployeeData;
}
