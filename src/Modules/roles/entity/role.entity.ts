import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';

@Entity({ name: 'roles' })
export class RoleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 64 })
    slug: string;

    @Column({ length: 128 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description?: string | null;

    @Column({ default: false })
    isSystem: boolean;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => RolePermissionEntity, (permission) => permission.role, {
        cascade: true,
    })
    permissions?: RolePermissionEntity[];
}
