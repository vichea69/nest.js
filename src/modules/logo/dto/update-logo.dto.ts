import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Sign } from 'crypto';

export class UpdateLogoDto {
  @IsOptional()
  @IsUrl()
  @MaxLength(600)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  link?: string;

}
