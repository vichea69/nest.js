import { UserEntity } from "@/user/user.entity";
import { BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'articles' })
export class ArticleEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    slug: string;

    @Column({ default: '' })
    description: string;

    @Column({ default: '' })
    body: string;

    @Column()
    title: string;

    @Column('simple-array')
    tagList: string[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ default: 0 })
    favoritesCount: number;

    @Column()
    authorId: number;

    //Relationships
    @ManyToOne(() => UserEntity, (user) => user.articles, { eager: true })
    @JoinColumn({ name: 'authorId' })
    author: UserEntity;


    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }

}