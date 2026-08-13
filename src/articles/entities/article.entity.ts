import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    slug: string;

    @Column()
    title: string;

    @Column({ default: '' })
    description: string;

    @Column({ type: 'text' })
    body: string;

    // Sử dụng 'simple-array' để TypeORM tự convert mảng string thành chuỗi lưu vào DB
    @Column('simple-array', { nullable: true })
    tagList: string[];

    @Column({ default: 0 })
    favoritesCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Khóa ngoại: Nhiều bài viết thuộc về 1 User
    @ManyToOne(() => User, (user) => user.articles, { eager: true })
    author: User;

    // Logic tự động sinh slug (URL-friendly) từ title trước khi lưu (chỉ khi Insert)
    @BeforeInsert()
    generateSlug() {
        if (this.title) {
            // Chuyển thành chữ thường, thay dấu cách bằng gạch ngang, và thêm chuỗi random chống trùng lặp
            this.slug = this.title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
        }
    }
}