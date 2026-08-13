import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Put, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { t } from '../utils/i18n.util';

@Controller('api/articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    // 1. CREATE ARTICLE (Yêu cầu đăng nhập)
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Request() req,
        // Bóc tách object "article" từ Body request
        @Body('article') createArticleDto: CreateArticleDto
    ) {
        const article = await this.articlesService.create(req.user.id, createArticleDto);
        return { article };
    }

    // 2. LIST ARTICLES (Bất kỳ ai cũng xem được)
    @Get()
    async findAll(@Query() query: QueryArticleDto) {
        return this.articlesService.findAll(query); // Returns { articles, articlesCount }
    }

    // 3. FEED ARTICLES (Phải đăng nhập) ĐẶT TRÊN GET ':slug'
    @UseGuards(JwtAuthGuard)
    @Get('feed')
    async findFeed(@Request() req, @Query() query: QueryArticleDto) {
        return this.articlesService.findFeed(req.user.id, query); // Returns { articles, articlesCount }
    }

    // 4. GET ARTICLE (Không yêu cầu đăng nhập)
    @Get(':slug')
    async findOne(@Param('slug') slug: string) {
        const article = await this.articlesService.findOne(slug);
        return { article };
    }

    // 5. UPDATE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Put(':slug')
    async update(
        @Param('slug') slug: string,
        @Request() req,
        @Body('article') updateArticleDto: UpdateArticleDto,
    ) {
        const article = await this.articlesService.update(slug, req.user.id, updateArticleDto);
        return { article };
    }

    // 6. DELETE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Delete(':slug')
    async remove(@Param('slug') slug: string, @Request() req) {
        await this.articlesService.remove(slug, req.user.id);
        return { message: t('articles.DELETE_SUCCESS') };
    }

    // 7. FAVORITE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Post(':slug/favorite')
    async favorite(@Param('slug') slug: string, @Request() req) {
        const article = await this.articlesService.favorite(slug, req.user.id);
        return { article };
    }

    // 8. UNFAVORITE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Delete(':slug/favorite')
    async unfavorite(@Param('slug') slug: string, @Request() req) {
        const article = await this.articlesService.unfavorite(slug, req.user.id);
        return { article };
    }
}