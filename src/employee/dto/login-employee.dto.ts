import { IsNotEmpty, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginEmployeeData {
    
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly password: string;
}

export class LoginEmployeeDto {
    @ApiProperty()
    employee: LoginEmployeeData;
}
