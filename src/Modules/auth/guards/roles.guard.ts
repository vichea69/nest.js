import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? [];

        if (requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user as { role?: string } | undefined;
        const userRole = (user?.role ?? 'user').toString().toLowerCase();
        const allowed = requiredRoles.map(r => r.toString().toLowerCase()).includes(userRole);
        if (!allowed) throw new ForbiddenException('Insufficient role');
        return true;
    }
}


