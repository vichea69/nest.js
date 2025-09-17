import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {AuthRequest} from "@/types/expressRequest.interface";


export const User = createParamDecorator(
    (data: any, ctx: ExecutionContext): AuthRequest['user'] | undefined => {
        const request = ctx.switchToHttp().getRequest<AuthRequest>();
        const user = (request as any).user as AuthRequest['user'] | undefined;

        if (data) {
            return (user as any)?.[data];
        }

        return user?.id ? user : undefined;
    }
)
