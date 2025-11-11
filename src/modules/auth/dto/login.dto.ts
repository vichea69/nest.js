import { isEmail, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    
    @IsEmail()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;
}