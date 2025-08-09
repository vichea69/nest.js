import { Body, Controller, Get, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { IUserResponse } from './types/userResponse.interface';
import { LoginDto } from './dto/loginUser.dto';
import type { AuthRequest } from '@/types/expressRequest.interface';
import { User } from './decorators/user.decorator';




@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }
    //Create user
    @Post()
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<IUserResponse> {
        return await this.userService.createUser(createUserDto);
    }
    //Login user
    @Post('login')
    @UsePipes(new ValidationPipe())
    async loginUser(@Body('user') loginUserDto: LoginDto): Promise<IUserResponse> {
        const user = await this.userService.login(loginUserDto);
        return this.userService.generateUserResponse(user);
    }
    //Get current user
    @Get('user')
    async getCurrentUser(@User() user): Promise<IUserResponse> {
        console.log('user', user);
        return this.userService.generateUserResponse(user);
    }
}   