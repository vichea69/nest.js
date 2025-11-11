import { Action } from '../enums/actions.enum';
import { Resource } from '../enums/resource.enum';

export interface PermissionRequirement {
    resource: Resource;
    actions: Action[];
}
