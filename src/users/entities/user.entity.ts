import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
  OneToMany
} from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { Comment } from '../../comments/entities/comment.entity';

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

  //Danh sách bài viết của User này
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  // Khai báo thả tim
  @ManyToMany(() => Article)
  @JoinTable({ name: 'user_favorites' }) // Tên bảng trung gian
  favorites: Article[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
