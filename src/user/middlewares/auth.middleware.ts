import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { UserService } from "../user.service";
import { verify } from "jsonwebtoken";
import { UserEntity } from "../user.entity";
import { AuthRequest } from "@/types/expressRequest.interface";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly userService: UserService
    ) { }

    async use(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        if (!req.headers.authorization) {
            return next();
        }

        const token = req.headers.authorization.split(' ')[1];

        try {
            const decoded: any = verify(token, process.env.JWT_SECRET as string);
            const user = await this.userService.findById(decoded.id as number);
            req.user = user;
            return next();
        } catch (error) {
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
        }
    }

}