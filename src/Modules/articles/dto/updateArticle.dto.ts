import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    body?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tagList?: string[];
}


