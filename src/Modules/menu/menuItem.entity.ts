import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MenuEntity } from '@/Modules/menu/menu.entity';

@Entity({ name: 'menu_items' })
export class MenuItemEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => MenuEntity, (menu) => menu.items, { onDelete: 'CASCADE' })
  @Index()
  menu: MenuEntity;

  @ManyToOne(() => MenuItemEntity, (item) => item.children, { nullable: true, onDelete: 'SET NULL' })
  @Index()
  parent?: MenuItemEntity | null;

  @OneToMany(() => MenuItemEntity, (item) => item.parent)
  children?: MenuItemEntity[];

  @Column({ length: 200 })
  label: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url?: string | null;

  @Column({ type: 'varchar', length: 240, nullable: true })
  pageSlug?: string | null;

  @Column({ type: 'boolean', default: false })
  external: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  target?: string | null; // e.g., _self, _blank

  @Column({ type: 'varchar', length: 120, nullable: true })
  icon?: string | null;

  @Index()
  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
