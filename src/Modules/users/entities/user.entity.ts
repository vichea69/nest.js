import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../auth/enums/role.enum';
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

    @Column({ type: 'text', nullable: true })
    resetPasswordToken: string | null = null;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordTokenExpiresAt: Date | null = null;

    @Column({
        type: 'varchar',
        length: 64,
        default: Role.User,
    })
    role: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt)
        }
    }

}   
