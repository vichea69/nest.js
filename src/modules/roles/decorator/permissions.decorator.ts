import { SetMetadata } from '@nestjs/common';
import { PermissionRequirement } from '../types/permission-requirement.type';
import { Action } from '../enums/actions.enum';

export const PERMISSIONS_KEY = 'permissions';

const normalize = (requirement: PermissionRequirement): PermissionRequirement => {
    const unique = new Set(requirement.actions && requirement.actions.length > 0 ? requirement.actions : [Action.Read]);
    return {
        resource: requirement.resource,
        actions: Array.from(unique),
    };
};

export const Permissions = (
    ...requirements: PermissionRequirement[]
): ReturnType<typeof SetMetadata> => {
    const payload = requirements.map(normalize);
    return SetMetadata(PERMISSIONS_KEY, payload);
};
