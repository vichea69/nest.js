import { Delete, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { IUserResponse } from "./types/userResponse.interface";
import { sign, verify } from "jsonwebtoken";
import { compare } from "bcrypt";

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
    return user;
  }
  ///Find one

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





//generate token random number 
  generateToken(user: UserEntity): string {
    //console.log(process.env.JWT_SECRET);

    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET
    );

    // const decode = verify(generateToken, 'SECRET12345678abcdfg');
    // console.log(decode);
    // return generateToken;
  }

  generateUserResponse(user: UserEntity): IUserResponse {
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return {
      user: {
        ...user,
        token: this.generateToken(user)
      }
    }
  }
}