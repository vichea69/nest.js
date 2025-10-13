import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUserResponse } from './types/userResponse.interface';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorator/permissions.decorator';
import { Resource } from '../roles/enums/resource.enum';
import { Action } from '../roles/enums/actions.enum';
import { User } from '../auth/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateRolePermissionsDto } from '../roles/dto/role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Users, actions: [Action.Read] })
  // admin-only checkbox: needs users.read to list everyone
  async getUsers() {
    return await this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@User() user): Promise<IUserResponse> {
    return await this.usersService.generateUserResponse(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Users, actions: [Action.Read] })
  // same read permission lets admins fetch a single user
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getAdminUserProfile(id);
  }

  @Put('me')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Users, actions: [Action.Update] })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async updateCurrentUser(
    @User('id') userId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.usersService.updateUser(userId, updateUserDto);
    return await this.usersService.generateUserResponse(user);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Users, actions: [Action.Create] })
  // checkbox combo users.create gives admin the “Create user” button
  @UsePipes(new ValidationPipe())
  async adminCreateUser(@Body('user') dto: AdminCreateUserDto): Promise<IUserResponse> {
    const user = await this.usersService.adminCreateUser(dto);
    return await this.usersService.generateUserResponse(user);
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Users, actions: [Action.Update] })
  // users.update toggles the edit checkbox, letting admin change roles via UI
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async adminUpdateUser(
    @Param('id') id: string,
    @Body('user') dto: UpdateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.usersService.adminUpdateUser(Number(id), dto);
    return await this.usersService.generateUserResponse(user);
  }

  @Put(':id/permissions')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(
    { resource: Resource.Users, actions: [Action.Update] },
    { resource: Resource.Roles, actions: [Action.Update] },
  )
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async adminAssignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    // combine users.update + roles.update checkboxes: clone/update a custom role for this user
    return await this.usersService.assignPermissionsToUser(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Users, actions: [Action.Delete] })
  // users.delete checkbox removes the “Delete user” option
  async adminDeleteUser(@Param('id') id: string) {
    await this.usersService.adminDeleteUser(Number(id));
    return { message: 'User deleted successfully' };
  }
}
