import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entity/role.entity';
import { RolePermissionEntity } from './entity/role-permission.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity])],
    controllers: [RoleController],
    providers: [RoleService, PermissionsGuard],
    exports: [RoleService, PermissionsGuard],
})
export class RoleModule {}
