<<<<<<< HEAD
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
=======
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserData {

  @ApiProperty()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;
}

export class LoginUserDto {
  @ApiProperty()
  user: LoginUserData;
}
>>>>>>> 635d760783eac8ac3563eb56146f0849ac448b72
