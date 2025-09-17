import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}   
