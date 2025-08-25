import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany, JoinTable, ManyToMany } from "typeorm";
import * as bcrypt from 'bcrypt';
import { ArticleEntity } from "@/article/article.entity";
import { Role } from "./enums/role.enum";
//define the user entity with the columns
@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column({ default: '' })
    bio: string;

    @Column({ default: '' })
    image: string;

    @Column()
    password: string;

    @Column({ type: 'timestamp', nullable: true })
    lastLogin?: Date | null;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.User,
    })
    role: Role;


    //Relationships
    @OneToMany(() => ArticleEntity, (article) => article.author)
    articles: ArticleEntity[];

    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    favorites: ArticleEntity[];

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt)
        }
    }

}   
