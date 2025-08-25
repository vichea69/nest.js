import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageStatus } from '@/Modules/page/page.entity';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @MinLength(2)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;

  // SEO
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

}
