import {Body, Controller, Get, Post, Put, Res, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/createUser.dto';
import {IUserResponse} from './types/userResponse.interface';
import {User} from './decorators/user.decorator';
import {AuthGuard} from './guards/auth.guard';
import {UpdateUserDto} from './dto/updateUser.dto';
import {LoginDto} from './dto/loginUser.dto';
import express from 'express';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    //Create user
    @Post('register')
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<IUserResponse> {
        return await this.userService.createUser(createUserDto);
    }

    //Login user
    @Post('login')
    @UsePipes(new ValidationPipe())
    async loginUser(
        @Body('user') loginUserDto: LoginDto,
        @Res({passthrough: true}) res: express.Response,
    ): Promise<IUserResponse> {
        const user = await this.userService.login(loginUserDto);
        const response = this.userService.generateUserResponse(user);

        // httpOnly cookie for Next middleware / server components
        res.cookie('access_token', response.user.token, {
            httpOnly: true,
            sameSite: 'lax',     // for localhost over http
            secure: false,       // set true in HTTPS production
            path: '/',
            maxAge: 15 * 60 * 1000,
        });

        return response; // body still returns { user: {..., token } }
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
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}))
    async updateUser(
        @User('id') userId: number,
        @Body('user') updateUserDto: UpdateUserDto
    ): Promise<IUserResponse> {
        const user = await this.userService.updateUser(userId, updateUserDto);
        return this.userService.generateUserResponse(user);
    }

    @Post('logout')
    async logout(@Res({passthrough: true}) res: express.Response) {
        // Clear the cookie by name and path (must match how it was set)
        res.clearCookie('access_token', {path: '/'});
        return {ok: true};
    }
    //Get all users
    @Get('users')
    async getUsers() {
        return await this.userService.findAll();
    }
}   