import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: '' })
    bio: string;

    @Column({ default: null, nullable: true })
    image: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Danh sách những người mà User này đang theo dõi
    @ManyToMany(() => User, (user) => user.followers)
    @JoinTable({
        name: 'user_follows', // Tên bảng trung gian
        joinColumn: {
            name: 'follower_id', // ID người đi follow
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'following_id', // ID người được follo    w
            referencedColumnName: 'id',
        },
    })
    following: User[];

    // Danh sách những người đang theo dõi User này
    @ManyToMany(() => User, (user) => user.following)
    followers: User[];
}