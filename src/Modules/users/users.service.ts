import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserResponse } from './types/userResponse.interface';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    await this.ensureUniqueCredentials(createUserDto.email, createUserDto.username);

    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async adminCreateUser(dto: AdminCreateUserDto): Promise<UserEntity> {
    await this.ensureUniqueCredentials(dto.email, dto.username);

    const newUser = this.userRepository.create(dto);
    return await this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(userId);
    await this.mergeUpdates(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async adminUpdateUser(targetUserId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(targetUserId);
    await this.mergeUpdates(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async adminDeleteUser(targetUserId: number): Promise<void> {
    const user = await this.findById(targetUserId);
    await this.userRepository.remove(user);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }

  generateUserResponse(user: UserEntity): IUserResponse {
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
        role: user.role,
        lastLogin: user.lastLogin,
        token: this.generateAccessToken(user),
        refreshToken: this.generateRefreshToken(user),
      },
    };
  }

  async ensureUniqueCredentials(email: string, username: string): Promise<void> {
    const [userByEmail, userByUsername] = await Promise.all([
      this.userRepository.findOne({ where: { email } }),
      this.userRepository.findOne({ where: { username } }),
    ]);

    if (userByEmail || userByUsername) {
      throw new HttpException('Email or username are already in use', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  private async mergeUpdates(user: UserEntity, updateUserDto: UpdateUserDto): Promise<void> {
    const { password: maybeNewPassword, ...rest } = updateUserDto as Partial<UpdateUserDto> & { password?: string };
    Object.assign(user, rest);

    if (typeof maybeNewPassword === 'string' && maybeNewPassword.trim().length > 0) {
      user.password = await hash(maybeNewPassword, 10);
    }
  }

  private generateAccessToken(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        type: 'access',
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    );
  }

  private generateRefreshToken(user: UserEntity): string {
    const secret = (process.env.JWT_REFRESH_SECRET as string) || (process.env.JWT_SECRET as string);

    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        type: 'refresh',
      },
      secret,
      { expiresIn: '7d' },
    );
  }
}
