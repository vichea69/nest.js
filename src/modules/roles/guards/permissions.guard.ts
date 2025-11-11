import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator';
import { PermissionRequirement } from '../types/permission-requirement.type';
import { RoleService } from '../role.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly roleService: RoleService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requirements =
            this.reflector.getAllAndOverride<PermissionRequirement[]>(PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) ?? [];

        if (requirements.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as { role?: string } | undefined;
        const roleSlug = user?.role;

        if (!roleSlug) {
            throw new ForbiddenException('Missing role on current user.');
        }

        const isAllowed = await this.roleService.roleHasPermissions(roleSlug, requirements);
        if (!isAllowed) {
            throw new ForbiddenException('You do not have permission to perform this action.');
        }

        return true;
    }
}
