import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

