import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  label: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  url?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  parentId?: number;
}
