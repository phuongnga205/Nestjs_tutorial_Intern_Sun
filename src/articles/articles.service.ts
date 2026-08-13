import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { In, Like } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { t } from '../utils/i18n.util';
import { plainToInstance } from 'class-transformer';
import { ArticleResponseDto } from './dto/article-response.dto';
import { DataAccessorProvider, IDataAccessorContext } from '../database/data-accessor.provider';
import { User } from '../users/entities/user.entity';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
    @Inject(DataAccessorProvider)
    private readonly dataAccessor!: DataAccessorProvider;

    private formatResponse(articleOrArticles: any) {
        return plainToInstance(ArticleResponseDto, articleOrArticles, { excludeExtraneousValues: true });
    }

    async create(userId: number, createArticleDto: CreateArticleDto) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const author = await txn.fetchRecord(User, { where: { id: userId } });
            if (!author) throw new NotFoundException(t('articles.NOT_FOUND_USER'));

            const newArticle = txn.buildRecord(Article, {
                ...createArticleDto,
                author: author,
            });

            await txn.storeRecord(Article, newArticle);

            return this.formatResponse(newArticle);
        });
    }

    async findOne(slug: string) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const article = await txn.fetchRecord(Article, {
                where: { slug },
                relations: { author: true },
            });

            if (!article) throw new NotFoundException(t('articles.NOT_FOUND_ARTICLE'));

            return this.formatResponse(article);
        });
    }

    async update(slug: string, userId: number, updateArticleDto: UpdateArticleDto) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const article = await txn.fetchRecord(Article, {
                where: { slug },
                relations: { author: true },
            });

            if (!article) throw new NotFoundException(t('articles.NOT_FOUND_ARTICLE'));

            if (article.author.id !== userId) {
                throw new ForbiddenException(t('articles.FORBIDDEN_UPDATE'));
            }

            Object.assign(article, updateArticleDto);
            
            // Nếu có update title, tiến hành sinh slug mới
            if (updateArticleDto.title) {
                article.slug = updateArticleDto.title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
            }
            
            await txn.storeRecord(Article, article);

            return this.formatResponse(article);
        });
    }

    async remove(slug: string, userId: number) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const article = await txn.fetchRecord(Article, {
                where: { slug },
                relations: { author: true },
            });

            if (!article) throw new NotFoundException(t('articles.NOT_FOUND_ARTICLE'));

            if (article.author.id !== userId) {
                throw new ForbiddenException(t('articles.FORBIDDEN_DELETE'));
            }

            await txn.archiveRecord(Article, article);
        });
    }

    async favorite(slug: string, userId: number) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const user = await txn.fetchRecord(User, {
                where: { id: userId },
                relations: { favorites: true },
            });

            if (!user) throw new NotFoundException(t('articles.NOT_FOUND_USER'));

            const article = await txn.fetchRecord(Article, {
                where: { slug },
                relations: { author: true },
            });
            if (!article) throw new NotFoundException(t('articles.NOT_FOUND_ARTICLE'));

            const isFavorited = user.favorites?.some((fav: any) => fav.id === article.id);

            if (!isFavorited) {
                if (!user.favorites) user.favorites = [];
                user.favorites.push(article);
                article.favoritesCount += 1;

                await txn.storeRecord(User, user);
                await txn.storeRecord(Article, article);
            }

            return this.formatResponse(article);
        });
    }

    async unfavorite(slug: string, userId: number) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const user = await txn.fetchRecord(User, {
                where: { id: userId },
                relations: { favorites: true },
            });

            if (!user) throw new NotFoundException(t('articles.NOT_FOUND_USER'));

            const article = await txn.fetchRecord(Article, {
                where: { slug },
                relations: { author: true },
            });
            if (!article) throw new NotFoundException(t('articles.NOT_FOUND_ARTICLE'));

            const isFavorited = user.favorites?.some((fav: any) => fav.id === article.id);

            if (isFavorited) {
                user.favorites = user.favorites.filter((fav: any) => fav.id !== article.id);
                article.favoritesCount -= 1;

                await txn.storeRecord(User, user);
                await txn.storeRecord(Article, article);
            }

            return this.formatResponse(article);
        });
    }

    async findAll(query: QueryArticleDto) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const where: any = {};

            if (query.tag) {
                where.tagList = Like(`%${query.tag}%`);
            }

            if (query.author) {
                where.author = { username: query.author };
            }

            if (query.favorited) {
                const favoritedUser = await txn.fetchRecord(User, {
                    where: { username: query.favorited },
                    relations: { favorites: true },
                });

                if (favoritedUser && favoritedUser.favorites?.length > 0) {
                    const favoriteIds = favoritedUser.favorites.map((fav: any) => fav.id);
                    where.id = In(favoriteIds);
                } else if (favoritedUser && (!favoritedUser.favorites || favoritedUser.favorites.length === 0)) {
                    return { articles: [], articlesCount: 0 };
                }
            }

            const [articles, count] = await txn.fetchRecordsAndCount(Article, {
                where,
                relations: { author: true },
                order: { createdAt: 'DESC' },
                take: Number(query.limit) || 20,
                skip: Number(query.offset) || 0,
            });

            return { articles: this.formatResponse(articles), articlesCount: count };
        });
    }

    async findFeed(userId: number, query: QueryArticleDto) {
        return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
            const currentUser = await txn.fetchRecord(User, {
                where: { id: userId },
                relations: { following: true },
            });

            if (!currentUser) throw new NotFoundException(t('articles.NOT_FOUND_USER'));

            const followingIds = currentUser.following?.map((user: any) => user.id) || [];

            if (followingIds.length === 0) {
                return { articles: [], articlesCount: 0 };
            }

            const [articles, count] = await txn.fetchRecordsAndCount(Article, {
                where: {
                    author: { id: In(followingIds) },
                },
                relations: { author: true },
                order: { createdAt: 'DESC' },
                take: Number(query.limit) || 20,
                skip: Number(query.offset) || 0,
            });

            return { articles: this.formatResponse(articles), articlesCount: count };
        });
    }
}
