import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthRequest } from "@/types/expressRequest.interface";
import { UserEntity } from "../user.entity";

export const User = createParamDecorator(
    (data: any, ctx: ExecutionContext): AuthRequest['user'] => {
        const request = ctx.switchToHttp().getRequest<AuthRequest>();
        const user = request.user;

        if(!request.user){
            throw new UnauthorizedException();
        }
       
        if(data){
            return user[data];
        }

        return user;
    }
)