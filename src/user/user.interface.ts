<<<<<<< HEAD
import { ApiProperty } from "@nestjs/swagger";

export class UserData {
    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    token: string;
    
    @ApiProperty()
    bio: string;
    
    @ApiProperty()
    image?: string;
=======
export interface UserData {
  email: string;
  token: string;
  bio: string;
  image?: string;
>>>>>>> 635d760783eac8ac3563eb56146f0849ac448b72
}

export class UserRO {
    @ApiProperty()
    user: UserData;
}