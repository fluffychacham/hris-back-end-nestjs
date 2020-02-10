<<<<<<< HEAD
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
=======
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
>>>>>>> 635d760783eac8ac3563eb56146f0849ac448b72
