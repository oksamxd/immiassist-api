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
  visaExpiry?: string;

  @IsOptional()
  @IsString()
  employerOrUniversity?: string;

  @IsOptional()
  @IsString()
  portOfEntry?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;
}
