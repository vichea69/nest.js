import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'site_settings' })
export class SiteSettingEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 200 })
  siteName: string;

  @Column({ type: 'text', nullable: true })
  siteDescription?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  siteKeyword?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sitePhone?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  siteEmail?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  siteAuthor?: string | null;

  @Column({ type: 'varchar', length: 600, nullable: true })
  siteLogo?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
