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

  @ApiProperty()
  role: string;
}

export class UserRO {
    @ApiProperty()
    user: UserData;
}

export class UserCompanyRO {
  @ApiProperty()
  user: UserData;
  
  @ApiProperty()
  company: CompanyData;
}