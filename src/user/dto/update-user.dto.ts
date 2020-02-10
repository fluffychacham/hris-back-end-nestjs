import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserData {
  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly bio: string;

  @ApiProperty()
  readonly image: string;
}

export class UpdateUserDto {
  @ApiProperty()
  user: UpdateUserData;
}