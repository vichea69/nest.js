import {Body, Controller, Delete, Get, Param, Post, Put, Res, UseGuards, UsePipes, ValidationPipe, UnauthorizedException, Req} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/createUser.dto';
import {IUserResponse} from './types/userResponse.interface';
import {User} from './decorators/user.decorator';
import {AuthGuard} from './guards/auth.guard';
import {UpdateUserDto} from './dto/updateUser.dto';
import {LoginDto} from './dto/loginUser.dto';
import express from 'express';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './enums/role.enum';
import { AdminCreateUserDto } from './dto/adminCreateUser.dto';
import { verify } from 'jsonwebtoken';

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

        // httpOnly cookies for Next middleware / server components
        res.cookie('access_token', response.user.token, {
            httpOnly: true,
            sameSite: 'lax',     // for localhost over http
            secure: false,       // set true in HTTPS production
            path: '/',
            maxAge: 15 * 60 * 1000,
        });
        // refresh token cookie (longer-lived)
        res.cookie('refresh_token', (response.user as any).refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor)
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}))
    async updateUser(
        @User('id') userId: number,
        @Body('user') updateUserDto: UpdateUserDto
    ): Promise<IUserResponse> {
        const user = await this.userService.updateUser(userId, updateUserDto);
        return this.userService.generateUserResponse(user);
    }

    @Post('logout')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor, Role.User)
    async logout(@Res({passthrough: true}) res: express.Response) {
        // Clear the cookie by name and path (must match how it was set)
        res.clearCookie('access_token', {path: '/'});
        res.clearCookie('refresh_token', {path: '/'});
        return {ok: true};
    }

    // Refresh access token using refresh token cookie
    @Post('refresh')
    async refresh(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ): Promise<IUserResponse> {
        const refreshCookie = (req as any).cookies?.['refresh_token'] as string | undefined;
        if (!refreshCookie) throw new UnauthorizedException('Missing refresh token');

        try {
            const secret = (process.env.JWT_REFRESH_SECRET as string) || (process.env.JWT_SECRET as string);
            const decoded: any = verify(refreshCookie, secret);
            if (!decoded || decoded.type !== 'refresh' || !decoded.id) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const user = await this.userService.findById(Number(decoded.id));
            const response = this.userService.generateUserResponse(user);

            // Re-issue cookies
            res.cookie('access_token', response.user.token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
            res.cookie('refresh_token', (response.user as any).refreshToken, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return response;
        } catch (e) {
            throw new UnauthorizedException('Expired or invalid refresh token');
        }
    }
    //Get all users
    @Get('users')
    async getUsers() {
        return await this.userService.findAll();
    }

    // Admin create user with role
    @Post('admin/users')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @UsePipes(new ValidationPipe())
    async adminCreateUser(@Body('user') dto: AdminCreateUserDto): Promise<IUserResponse> {
        return await this.userService.adminCreateUser(dto);
    }

    // Admin update any user
    @Put('admin/users/:id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}))
    async adminUpdateUser(
        @Param('id') id: string,
        @Body('user') dto: UpdateUserDto
    ): Promise<IUserResponse> {
        const updated = await this.userService.adminUpdateUser(Number(id), dto);
        return this.userService.generateUserResponse(updated);
    }

    // Admin delete any user
    @Delete('admin/users/:id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async adminDeleteUser(@Param('id') id: string) {
        await this.userService.adminDeleteUser(Number(id));
        return { message: 'User deleted successfully' };
    }
}   
