import { UserEntity } from "../user.entity";

export type IUser = Omit<UserEntity, 'hashPassword'>;