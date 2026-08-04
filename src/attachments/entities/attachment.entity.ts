import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('attachments')
export class Attachment {
    // Dùng UUID để id là một chuỗi ngẫu nhiên, tránh bị hacker đoán được link ảnh
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column()
    file_name: string;

    @Column()
    file_type: string;

    @Column()
    file_size: number;

    // Polymorphic: Lưu ID của thực thể sở hữu ảnh này (ID của User)
    @Column({ type: 'int', nullable: true })
    entity_id: number;

    // Polymorphic: Phân loại ảnh ('user_avatar', 'article_image')
    @Column({ type: 'varchar', nullable: true })
    entity_type: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}