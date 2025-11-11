import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class AdminCreateUserDto {
    @IsNotEmpty()
    readonly username: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;

    @Matches(/^[a-z0-9-]+$/, { message: 'Role must be a slug using lowercase letters, numbers, or hyphens.' })
    readonly role: string;
}
