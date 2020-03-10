import { ApiProperty } from "@nestjs/swagger";

class PasswordResetData {
    @ApiProperty()
    password_confirm_code: string;

    @ApiProperty()
    password: string;
}

export class PasswordResetDto {
    @ApiProperty()
    user: PasswordResetData;
}