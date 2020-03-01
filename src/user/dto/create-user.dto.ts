import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCompanyData } from '../../company/dto';

export class CreateUserData {

  @ApiProperty()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;
}

export class CreateUserDto {
  @ApiProperty()
  user: CreateUserData;
  
  @ApiProperty()
  company: CreateCompanyData;
}
