import { Action } from '../enums/actions.enum';
import { Resource } from '../enums/resource.enum';

export interface PermissionToggle {
    action: Action;
    label: string;
    enabled: boolean;
}

export interface PermissionMatrixRow {
    resource: Resource;
    label: string;
    description: string;
    toggles: PermissionToggle[];
}

export interface RoleSummary {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
    isActive: boolean;
    permissionsCount: number;
    resourcesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface RolePermissionSummary {
    role: RoleSummary;
    matrix: PermissionMatrixRow[];
    stats: {
        selected: number;
        total: number;
    };
}
