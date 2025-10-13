import { UserType } from "./user.type";
import { Action } from "@/modules/roles/enums/actions.enum";
import { Resource } from "@/modules/roles/enums/resource.enum";

export interface IUserResponse {
    user: UserType & {
        token: string;
        refreshToken?: string;
        permissions?: Partial<Record<Resource, Action[]>>;
    }
}
