import { UserEntity } from '../entities/user.entity';

// Expose a safe subset of UserEntity fields to API consumers.
export type UserType = Omit<UserEntity, 'hashPassword' | 'password' | 'resetPasswordToken' | 'resetPasswordTokenExpiresAt'>;
