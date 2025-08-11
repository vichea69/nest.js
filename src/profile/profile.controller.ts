import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@/user/decorators/user.decorator';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get(':username')
  async getProfile(@User('id') currentUserId: number, @Param('username') profileUsername: string) {
    return await this.profileService.getProfile(currentUserId, profileUsername);
  }
}