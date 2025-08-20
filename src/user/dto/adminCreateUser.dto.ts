import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "../enums/role.enum";

export class AdminCreateUserDto {
    @IsNotEmpty()
    readonly username: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;

    @IsEnum(Role)
    readonly role: Role;
}


