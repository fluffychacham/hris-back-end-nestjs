import { EmployeeData } from "./employee.interface";
import { ApiProperty } from "@nestjs/swagger";

export class LoginEmployeeData extends EmployeeData {
    @ApiProperty()
    token: string;
}

export class LoginEmployeeRO {
    @ApiProperty()
    employee: LoginEmployeeData;
}