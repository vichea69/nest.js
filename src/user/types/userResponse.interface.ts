import { IUser } from "./user.type";

export interface IUserResponse {
    user: IUser & { token: string }
}