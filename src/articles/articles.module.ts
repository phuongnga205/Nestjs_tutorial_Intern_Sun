import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ArticlesService, ARTICLES_REPOSITORY, USERS_REPOSITORY_IN_ARTICLE } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './entities/article.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, User])],
  controllers: [ArticlesController],
  providers: [
    {
      provide: ARTICLES_REPOSITORY,
      useExisting: getRepositoryToken(Article),
    },
    {
      provide: USERS_REPOSITORY_IN_ARTICLE,
      useExisting: getRepositoryToken(User),
    },
    ArticlesService,
  ],
})
export class ArticlesModule { }