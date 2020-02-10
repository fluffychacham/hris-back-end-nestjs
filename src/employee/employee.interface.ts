import { ApiProperty } from "@nestjs/swagger";

export class EmployeeData {
    @ApiProperty()
    id: number;

    @ApiProperty()
    email: string;

    @ApiProperty()
    first_name: string;

    @ApiProperty()
    last_name: string;

    @ApiProperty()
    created: Date;

    @ApiProperty()
    updated: Date;

    @ApiProperty()
    role: string;

    @ApiProperty()
    company_name: string;

    @ApiProperty()
    reports_to: string;

    @ApiProperty()
    vacation_days: number;

    @ApiProperty()
    education_funds: number;

    @ApiProperty()
    phone_number: number;

    @ApiProperty()
    fitness_grant: number;

    @ApiProperty()
    day_to_review: Date;
}

export class EmployeeRO {
    @ApiProperty()
    employee: EmployeeData;
}
