import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  visaType?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  countryOfResidence?: string;

  @IsOptional()
  travelHistory?: any;

  @IsOptional()
  @IsString()
  currentVisaStatus?: string;

  @IsOptional()
  @IsString()
  visaExpiry?: string;

  @IsOptional()
  immigrationHistory?: any;

  @IsOptional()
  previousNotices?: any;

  @IsOptional()
  previousDenials?: any;

  @IsOptional()
  @IsString()
  currentEmployer?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  dependents?: any;
}
