import { UserEntity } from '@/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { ProfileType } from './types/profile.types';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    //get profile
    async getProfile(currentUserId: number, profileUsername: string) {
        const profile = await this.userRepository.findOne({
            where: {
                username: profileUsername
            }
        });
        if (!profile) {
            throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
        }
        return this.getProfileResponse(profile, currentUserId);

    }
    //response profile data format from type folder
    getProfileResponse(profile: UserEntity, currentUserId: number): ProfileResponseInterface {
        const response: ProfileType = {
            username: profile.username,
            bio: profile.bio,
            image: profile.image,
            following: false,
        };
        return { profile: response };
    }
}
