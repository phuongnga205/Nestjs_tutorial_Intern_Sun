import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { In, Like } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { I18nContext } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { ArticleResponseDto } from './dto/article-response.dto';

export const ARTICLES_REPOSITORY = 'ARTICLES_REPOSITORY';
export const USERS_REPOSITORY_IN_ARTICLE = 'USERS_REPOSITORY_IN_ARTICLE';

@Injectable()
export class ArticlesService {
    constructor(
        @Inject(ARTICLES_REPOSITORY)
        private readonly articleRepository: any,
        @Inject(USERS_REPOSITORY_IN_ARTICLE)
        private readonly userRepository: any,
    ) { }

    private formatResponse(articleOrArticles: any) {
        return plainToInstance(ArticleResponseDto, articleOrArticles, { excludeExtraneousValues: true });
    }

    async create(userId: number, createArticleDto: CreateArticleDto) {
        const author = await this.userRepository.findOne({ where: { id: userId } });
        if (!author) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_USER'));

        const newArticle = this.articleRepository.create({
            ...createArticleDto,
            author: author,
        });

        await this.articleRepository.save(newArticle);

        return { article: this.formatResponse(newArticle) };
    }

    async findOne(slug: string) {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true },
        });

        if (!article) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_ARTICLE'));

        return { article: this.formatResponse(article) };
    }

    async update(slug: string, userId: number, updateArticleDto: UpdateArticleDto) {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true },
        });

        if (!article) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_ARTICLE'));

        if (article.author.id !== userId) {
            throw new ForbiddenException(I18nContext.current()!.t('articles.FORBIDDEN_UPDATE'));
        }

        Object.assign(article, updateArticleDto);
        await this.articleRepository.save(article);

        return { article: this.formatResponse(article) };
    }

    async remove(slug: string, userId: number) {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true },
        });

        if (!article) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_ARTICLE'));

        if (article.author.id !== userId) {
            throw new ForbiddenException(I18nContext.current()!.t('articles.FORBIDDEN_DELETE'));
        }

        await this.articleRepository.remove(article);

        return { message: I18nContext.current()!.t('articles.DELETE_SUCCESS') };
    }

    async favorite(slug: string, userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: { favorites: true },
        });

        if (!user) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_USER'));

        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true },
        });
        if (!article) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_ARTICLE'));

        const isFavorited = user.favorites.some((fav: any) => fav.id === article.id);

        if (!isFavorited) {
            user.favorites.push(article);
            article.favoritesCount += 1;

            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return { article: this.formatResponse(article) };
    }

    async unfavorite(slug: string, userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: { favorites: true },
        });

        if (!user) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_USER'));

        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true },
        });
        if (!article) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_ARTICLE'));

        const isFavorited = user.favorites.some((fav: any) => fav.id === article.id);

        if (isFavorited) {
            user.favorites = user.favorites.filter((fav: any) => fav.id !== article.id);
            article.favoritesCount -= 1;

            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return { article: this.formatResponse(article) };
    }

    async findAll(query: QueryArticleDto) {
        const where: any = {};

        if (query.tag) {
            where.tagList = Like(`%${query.tag}%`);
        }

        if (query.author) {
            where.author = { username: query.author };
        }

        if (query.favorited) {
            const favoritedUser = await this.userRepository.findOne({
                where: { username: query.favorited },
                relations: { favorites: true },
            });

            if (favoritedUser && favoritedUser.favorites.length > 0) {
                const favoriteIds = favoritedUser.favorites.map((fav: any) => fav.id);
                where.id = In(favoriteIds);
            } else if (favoritedUser && favoritedUser.favorites.length === 0) {
                return { articles: [], articlesCount: 0 };
            }
        }

        const [articles, count] = await this.articleRepository.findAndCount({
            where,
            relations: { author: true },
            order: { createdAt: 'DESC' },
            take: Number(query.limit) || 20,
            skip: Number(query.offset) || 0,
        });

        return { articles: this.formatResponse(articles), articlesCount: count };
    }

    async findFeed(userId: number, query: QueryArticleDto) {
        const currentUser = await this.userRepository.findOne({
            where: { id: userId },
            relations: { following: true },
        });

        if (!currentUser) throw new NotFoundException(I18nContext.current()!.t('articles.NOT_FOUND_USER'));

        const followingIds = currentUser.following?.map((user: any) => user.id) || [];

        if (followingIds.length === 0) {
            return { articles: [], articlesCount: 0 };
        }

        const [articles, count] = await this.articleRepository.findAndCount({
            where: {
                author: { id: In(followingIds) },
            },
            relations: { author: true },
            order: { createdAt: 'DESC' },
            take: Number(query.limit) || 20,
            skip: Number(query.offset) || 0,
        });

        return { articles: this.formatResponse(articles), articlesCount: count };
    }
}
