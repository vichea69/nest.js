import { UserEntity } from "@/user/user.entity";
import { Request } from "express";

export interface AuthRequest extends Request {
    user: UserEntity;
}