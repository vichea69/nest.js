import { UserEntity } from "@/modules/users/entities/user.entity";
import { Request } from "express";

export interface AuthRequest extends Request {
    user: UserEntity;
}