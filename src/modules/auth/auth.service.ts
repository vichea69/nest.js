import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { verify } from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { MailerService } from './mailer/mailer.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendResetEmailDto } from './dto/resend-reset-email.dto';
import { IUserResponse } from '../users/types/userResponse.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async register(dto: CreateUserDto): Promise<IUserResponse> {
    const user = await this.usersService.createUser(dto);
    return await this.usersService.generateUserResponse(user);
  }

  async login(dto: LoginDto): Promise<UserEntity> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const passwordMatches = await compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new HttpException('Invalid password', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    user.lastLogin = new Date();
    return await this.usersService.save(user);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return;
    }

    const token = await this.assignPasswordResetToken(user);
    await this.mailerService.sendPasswordResetEmail(user.email, token);
  }

  async resendPasswordReset(dto: ResendResetEmailDto): Promise<void> {
    await this.forgotPassword(dto);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<UserEntity> {
    const hashedToken = this.hashResetToken(dto.token);

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpiresAt: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new HttpException('Reset token is invalid or has expired', HttpStatus.BAD_REQUEST);
    }

    user.password = await hash(dto.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiresAt = null;

    return await this.usersService.save(user);
  }

  async refreshAccessToken(refreshToken: string): Promise<UserEntity> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    try {
      const secret = (process.env.JWT_REFRESH_SECRET as string) || (process.env.JWT_SECRET as string);
      const decoded: any = verify(refreshToken, secret);

      if (!decoded || decoded.type !== 'refresh' || !decoded.id) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return await this.usersService.findById(Number(decoded.id));
    } catch {
      throw new UnauthorizedException('Expired or invalid refresh token');
    }
  }

  private async assignPasswordResetToken(user: UserEntity): Promise<string> {
    const { rawToken, hashedToken, expiresAt } = this.createPasswordResetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpiresAt = expiresAt;
    await this.usersService.save(user);
    return rawToken;
  }

  private createPasswordResetToken(): { rawToken: string; hashedToken: string; expiresAt: Date } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return { rawToken, hashedToken, expiresAt };
  }

  private hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
