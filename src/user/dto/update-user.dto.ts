import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class UpdateUserData {
    @ApiPropertyOptional()
    readonly username: string;

    @ApiPropertyOptional()
    readonly email: string;

    @ApiPropertyOptional()
    readonly bio: string;

    @ApiPropertyOptional()
    readonly image: string;
}

export class UpdateUserDto {
    @ApiProperty()
    user: UpdateUserData;
}
