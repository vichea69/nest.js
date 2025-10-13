import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendResetEmailDto } from './dto/resend-reset-email.dto';
import { UsersService } from '../users/users.service';
import { IUserResponse } from '../users/types/userResponse.interface';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body('user') dto: CreateUserDto): Promise<IUserResponse> {
    return await this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IUserResponse> {
    const user = await this.authService.login(dto);
    const response = await this.usersService.generateUserResponse(user);

    this.attachAuthCookies(res, response);
    return response;
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe())
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  @Post('forgot-password/resend')
  @UsePipes(new ValidationPipe())
  async resendForgotPassword(@Body() dto: ResendResetEmailDto): Promise<{ message: string }> {
    await this.authService.resendPasswordReset(dto);
    return { message: 'If a reset request exists, a new email was sent.' };
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe())
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<IUserResponse> {
    const user = await this.authService.resetPassword(dto);
    return await this.usersService.generateUserResponse(user);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ ok: boolean }> {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IUserResponse> {
    const refreshToken = (req as any).cookies?.['refresh_token'] as string | undefined;
    const user = await this.authService.refreshAccessToken(refreshToken ?? '');
    const response = await this.usersService.generateUserResponse(user);

    this.attachAuthCookies(res, response);
    return response;
  }

  private attachAuthCookies(res: Response, response: IUserResponse): void {
    res.cookie('access_token', response.user.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', (response.user as any).refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
