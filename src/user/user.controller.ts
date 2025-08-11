import { Body, Controller, Get, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { IUserResponse } from './types/userResponse.interface';
import { LoginDto } from './dto/loginUser.dto';
import type { AuthRequest } from '@/types/expressRequest.interface';
import { User } from './decorators/user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserModule } from './user.module';




@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }
    //Create user
    @Post('register')
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
    @UseGuards(AuthGuard)
    async getCurrentUser(@User() user): Promise<IUserResponse> {
        console.log('user', user);
        return this.userService.generateUserResponse(user);
    }

    //Update user
    @Put('user')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    async updateUser(
        @User('id') userId: number,
        @Body('user') updateUserDto: UpdateUserDto
    ): Promise<IUserResponse> {
        const user = await this.userService.updateUser(userId, updateUserDto);
        return this.userService.generateUserResponse(user);
    }
}   