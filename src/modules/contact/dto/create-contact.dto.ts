import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateContactDto {
  @IsOptional()
  @IsString({ message: 'Email can not be only numbers' })
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;
}
