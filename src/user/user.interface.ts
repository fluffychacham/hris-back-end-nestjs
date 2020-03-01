import { ApiProperty } from "@nestjs/swagger";
import { CompanyData } from "../company/company.interface";

export class UserData {
  @ApiProperty()
  id: number;

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

export class UserRegisterRO {
  @ApiProperty()
  user: UserData;
  
  @ApiProperty()
  company: CompanyData;
}