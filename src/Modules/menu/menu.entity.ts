import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MenuItemEntity } from '@/Modules/menu/menuItem.entity';

@Entity({ name: 'menus' })
export class MenuEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 140 })
  slug: string;

  @Column({ type: 'text', nullable: true, default: '' })
  description?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Store FK id for consistency with patterns; relation optional eager=false
  // and without JoinColumn because not strictly required in current codebase
  // We still keep the relation for easy loading when needed.
  @OneToMany(() => MenuItemEntity, (item) => item.menu)
  items?: MenuItemEntity[];

}
