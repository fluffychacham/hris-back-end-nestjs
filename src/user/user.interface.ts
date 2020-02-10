import { ApiProperty } from "@nestjs/swagger";

export class UserData {
  @ApiProperty()
  email: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  image?: string;
}

export class UserRO {
    @ApiProperty()
    user: UserData;
}