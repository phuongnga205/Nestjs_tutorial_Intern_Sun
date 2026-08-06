import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { CommentsService, COMMENTS_REPOSITORY, ARTICLES_REPOSITORY_IN_COMMENT, USERS_REPOSITORY_IN_COMMENT } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Article } from '../articles/entities/article.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Article, User])],
  controllers: [CommentsController],
  providers: [
    {
      provide: COMMENTS_REPOSITORY,
      useExisting: getRepositoryToken(Comment),
    },
    {
      provide: ARTICLES_REPOSITORY_IN_COMMENT,
      useExisting: getRepositoryToken(Article),
    },
    {
      provide: USERS_REPOSITORY_IN_COMMENT,
      useExisting: getRepositoryToken(User),
    },
    CommentsService,
  ],
})
export class CommentsModule { }