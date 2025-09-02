import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'logos' })
export class LogoEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // Public URL to access the logo
  @Column({ type: 'varchar', length: 600 })
  url: string;

  // Optional title for CMS display
  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
