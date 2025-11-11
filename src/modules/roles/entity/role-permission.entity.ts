import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { Action } from '../enums/actions.enum';
import { Resource } from '../enums/resource.enum';

@Entity({ name: 'role_permissions' })
@Unique(['roleId', 'resource'])
export class RolePermissionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'role_id', type: 'int' })
    roleId: number;

    @ManyToOne(() => RoleEntity, (role) => role.permissions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @Column({ type: 'enum', enum: Resource })
    resource: Resource;

    @Column({ type: 'simple-json', default: () => "'[]'" })
    actions: Action[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
