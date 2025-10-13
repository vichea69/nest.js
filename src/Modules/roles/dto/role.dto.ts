import { ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, Length, Matches, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Action } from '../enums/actions.enum';
import { Resource } from '../enums/resource.enum';
import { PartialType } from '@nestjs/mapped-types';

export class PermissionDto {
    @IsEnum(Resource)
    resource: Resource;

    @IsArray()
    @ArrayUnique()
    @IsEnum(Action, { each: true })
    actions: Action[];
}

export class CreateRoleDto {
    @IsOptional()
    @IsString()
    @Length(2, 64)
    @Matches(/^[a-z0-9-]+$/, { message: 'Slug can contain lowercase letters, numbers and hyphens only.' })
    slug?: string;

    @IsString()
    @Length(2, 128)
    name: string;

    @IsOptional()
    @IsString()
    @Length(0, 255)
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions?: PermissionDto[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class UpdateRolePermissionsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions: PermissionDto[];
}
