import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateArticleDto {
    @IsNotEmpty() 
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    body: string;

    @IsArray()
    @IsString({each: true})
    tagList?: string[];
}