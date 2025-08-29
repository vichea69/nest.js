import { Delete, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { IUserResponse } from "./types/userResponse.interface";
import { sign, verify } from "jsonwebtoken";
import { compare, hash } from "bcrypt";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { AdminCreateUserDto } from "./dto/adminCreateUser.dto";

@Injectable()
// =============================
// UserService: Handles User CRUD
// =============================
export class UserService {

  // Inject the UserEntity repository into the service
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) { }
  async createUser(createUserDto: CreateUserDto): Promise<IUserResponse> {
    // Create a new instance of UserEntity
    const newUser = new UserEntity();

    // Copy all properties from DTO to the new entity instance
    Object.assign(newUser, createUserDto);

    //validation email 
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email
      }
    });

    const userByUsername = await this.userRepository.findOne({
      where: {
        username: createUserDto.username
      }
    });

    if (userByEmail || userByUsername) {
      throw new HttpException('Email or username are already in use', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const savedUser = await this.userRepository.save(newUser);
    return this.generateUserResponse(savedUser);

  }
  // Admin-create user with explicit role
  async adminCreateUser(dto: AdminCreateUserDto): Promise<IUserResponse> {
    const newUser = new UserEntity();
    Object.assign(newUser, dto);

    const [userByEmail, userByUsername] = await Promise.all([
      this.userRepository.findOne({ where: { email: dto.email } }),
      this.userRepository.findOne({ where: { username: dto.username } }),
    ]);

    if (userByEmail || userByUsername) {
      throw new HttpException('Email or username are already in use', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const saved = await this.userRepository.save(newUser);
    return this.generateUserResponse(saved);
  }
  ///login method 
  async login(loginUserDto: any): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email
      }
    });

    console.log(user, loginUserDto)

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    //check password
    const matchPassword = await compare(loginUserDto.password, user.password);
    if (!matchPassword) {
      throw new HttpException('Invalid password', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    user.lastLogin = new Date();
    return await this.userRepository.save(user);
  }

  //Get user by id 
  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: id
      }
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return user;
  }
  //Get all users
  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  //Update user
  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(userId);

    const isPasswordChanging = typeof updateUserDto.password === 'string' && updateUserDto.password.trim().length > 0;

    // Assign non-password fields
    const { password: maybeNewPassword, ...rest } = updateUserDto as Partial<UpdateUserDto> & { password?: string };
    Object.assign(user, rest);

    if (isPasswordChanging && typeof maybeNewPassword === 'string') {
      user.password = await hash(maybeNewPassword, 10);
    } else {
      // Preserve existing hash
      user.password = user.password;
    }

    return await this.userRepository.save(user);
  }

  // Admin update any user by id
  async adminUpdateUser(targetUserId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(targetUserId);

    const isPasswordChanging = typeof updateUserDto.password === 'string' && updateUserDto.password.trim().length > 0;

    const { password: maybeNewPassword, ...rest } = updateUserDto as Partial<UpdateUserDto> & { password?: string };
    Object.assign(user, rest);

    if (isPasswordChanging && typeof maybeNewPassword === 'string') {
      user.password = await hash(maybeNewPassword, 10);
    } else {
      user.password = user.password;
    }

    return await this.userRepository.save(user);
  }

  // Admin delete any user by id
  async adminDeleteUser(targetUserId: number): Promise<void> {
    const user = await this.findById(targetUserId);
    await this.userRepository.remove(user);
  }



  // Access token (short-lived)
  generateToken(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        type: 'access',
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
  }

  // Refresh token (long-lived)
  generateRefreshToken(user: UserEntity): string {
    // Use same secret unless JWT_REFRESH_SECRET is provided
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
      { expiresIn: '7d' }
    );
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
        token: this.generateToken(user),
        refreshToken: this.generateRefreshToken(user),
      }
    };
  }
}
