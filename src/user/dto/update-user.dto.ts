import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserData {

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly first_name: string;

  @ApiProperty()
  readonly last_name: string;
 
  @ApiProperty()
  readonly bio: string;

  @ApiProperty()
  readonly image: string;
}

export class UpdateUserDto {
  @ApiProperty()
  user: UpdateUserData;
}
