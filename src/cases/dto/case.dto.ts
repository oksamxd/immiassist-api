import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateCaseDto {
  @IsNotEmpty()
  @IsString()
  caseType: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

export class UpdateCaseStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
