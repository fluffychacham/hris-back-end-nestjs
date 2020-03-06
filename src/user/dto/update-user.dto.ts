import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserData {

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly firstName: string;

  @ApiProperty()
  readonly lastName: string;
 
  @ApiProperty()
  readonly bio: string;

  @ApiProperty()
  readonly image: string;
}

export class UpdateUserDto {
  @ApiProperty()
  user: UpdateUserData;
}
