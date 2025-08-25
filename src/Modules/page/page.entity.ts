import {BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';
import {UserEntity} from '@/user/user.entity';

export enum PageStatus {
    Draft = 'draft',
    Published = 'published',
}

@Entity({name: 'pages'})
export class PageEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({length: 200})
    title: string;

    @Column({unique: true, length: 240})
    slug: string;

    @Column({type: 'text'})
    content: string;

    @Column({type: 'enum', enum: PageStatus, default: PageStatus.Draft})
    status: PageStatus;

    @Column({type: 'timestamp', nullable: true})
    publishedAt?: Date | null;

    @ManyToOne(() => UserEntity, {nullable: true, onDelete: 'SET NULL'})
    author?: UserEntity | null;

    // SEO fields
    @Column({type: 'varchar', length: 255, nullable: true})
    metaTitle?: string | null;

    @Column({type: 'varchar', length: 500, nullable: true})
    metaDescription?: string | null;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }
}
