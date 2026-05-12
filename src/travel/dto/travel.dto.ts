import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTravelPlanDto {
  @IsNotEmpty()
  @IsString()
  caseId: string;

  @IsNotEmpty()
  @IsString()
  fromLocation: string;

  @IsNotEmpty()
  @IsString()
  toLocation: string;

  @IsOptional()
  @IsString()
  airline?: string;

  @IsOptional()
  @IsString()
  flightNumber?: string;

  @IsNotEmpty()
  @IsString()
  portOfEntry: string;

  @IsNotEmpty()
  @IsString()
  arrivalDatetime: string;

  @IsNotEmpty()
  @IsString()
  visaType: string;

  @IsOptional()
  @IsString()
  purposeOfTravel?: string;
}
