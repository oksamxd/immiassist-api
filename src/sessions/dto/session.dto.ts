import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  caseId: string;

  @IsNotEmpty()
  @IsString()
  sessionType: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
