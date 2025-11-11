import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PostStatus } from '@/modules/post/post.entity';
import { Transform, Type } from 'class-transformer';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  pageId?: number;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const raw = Array.isArray(value) ? value : String(value).split(',');
    const parsed = raw
      .map((item) => Number(String(item).trim()))
      .filter((num) => !Number.isNaN(num));
    return parsed.length ? parsed : undefined;
  })
  @IsArray()
  @IsInt({ each: true })
  replaceImageIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const raw = Array.isArray(value) ? value : String(value).split(',');
    const parsed = raw
      .map((item) => Number(String(item).trim()))
      .filter((num) => !Number.isNaN(num));
    return parsed.length ? parsed : undefined;
  })
  @IsArray()
  @IsInt({ each: true })
  removeImageIds?: number[];
}
