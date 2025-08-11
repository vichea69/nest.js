import { UserType } from "./user.type";

export interface IUserResponse {
    user: UserType & { token: string }
}