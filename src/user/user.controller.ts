import { Body, Controller, Get, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { IUserResponse } from './types/userResponse.interface';
import { LoginDto } from './dto/loginUser.dto';
import type { AuthRequest } from '@/types/expressRequest.interface';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    //@UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<IUserResponse> {
        return await this.userService.createUser(createUserDto);
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async loginUser(@Body('user') loginUserDto: LoginDto): Promise<IUserResponse> {
        const user = await this.userService.login(loginUserDto);
        return this.userService.generateUserResponse(user);
    }

    //GET 

    @Get('user')
    async getCurrentUser(@Req() request: AuthRequest): Promise<IUserResponse> {
        return this.userService.generateUserResponse(request.user);
    }
}   