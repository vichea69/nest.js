import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateLogoDto {
  @IsOptional()
  @IsUrl()
  @MaxLength(600)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
