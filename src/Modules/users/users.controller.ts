import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserResponse } from './types/userResponse.interface';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    return await this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@User() user): Promise<IUserResponse> {
    return this.usersService.generateUserResponse(user);
  }

  @Put('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async updateCurrentUser(
    @User('id') userId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.usersService.updateUser(userId, updateUserDto);
    return this.usersService.generateUserResponse(user);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  async adminCreateUser(@Body('user') dto: AdminCreateUserDto): Promise<IUserResponse> {
    const user = await this.usersService.adminCreateUser(dto);
    return this.usersService.generateUserResponse(user);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async adminUpdateUser(
    @Param('id') id: string,
    @Body('user') dto: UpdateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.usersService.adminUpdateUser(Number(id), dto);
    return this.usersService.generateUserResponse(user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async adminDeleteUser(@Param('id') id: string) {
    await this.usersService.adminDeleteUser(Number(id));
    return { message: 'User deleted successfully' };
  }
}
