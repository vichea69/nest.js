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
        const authHeader = req.headers.authorization ?? '';
        const cookieToken = (req as any).cookies?.['access_token'] as string | undefined;

        let token: string | undefined;
        if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (cookieToken) {
            token = cookieToken;
        }

        if (!token) {
            req.user = new UserEntity();
            return next();
        }

        try {
            const decoded: any = verify(token, process.env.JWT_SECRET as string);
            const user = await this.userService.findById(decoded.id as number);
            // Ensure role persists from DB
            req.user = user;
            return next();
        } catch (error) {
            // Do not block public routes on bad/expired tokens; leave user empty
            req.user = new UserEntity();
            return next();
        }
    }

}