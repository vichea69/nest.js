import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/entities/user.entity';
import { AuthRequest } from '@/types/expressRequest.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

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
      const user = await this.usersService.findById(decoded.id as number);
      req.user = user;
      return next();
    } catch {
      req.user = new UserEntity();
      return next();
    }
  }
}
