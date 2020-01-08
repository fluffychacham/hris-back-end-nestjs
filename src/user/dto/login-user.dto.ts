import { IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginUserData {
    @ApiPropertyOptional()
    @IsNotEmpty()
    readonly email: string;

    @ApiPropertyOptional()
    @IsNotEmpty()
    readonly password: string;
}

export class LoginUserDto {
    @ApiProperty()
    user: LoginUserData;
}
