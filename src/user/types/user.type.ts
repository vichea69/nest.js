import { UserEntity } from "../user.entity";

// Expose a safe subset of UserEntity fields to API consumers.
// Remove sensitive or heavy relations: password, articles, favorites.
export type UserType = Omit<UserEntity, 'hashPassword' | 'password' >;
