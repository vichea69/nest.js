import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSiteSettingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  siteName: string;

  @IsString()
  @IsOptional()
  siteDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  siteKeyword?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sitePhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  siteAuthor?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  siteEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(600)
  siteLogo?: string;
}
