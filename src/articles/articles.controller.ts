import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Put, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';

@Controller('api/articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    // 1. CREATE ARTICLE (Yêu cầu đăng nhập)
    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Request() req,
        // Bóc tách object "article" từ Body request
        @Body('article') createArticleDto: CreateArticleDto
    ) {
        return this.articlesService.create(req.user.id, createArticleDto);
    }

    // 2. LIST ARTICLES (Bất kỳ ai cũng xem được)
    @Get()
    findAll(@Query() query: QueryArticleDto) {
        return this.articlesService.findAll(query);
    }

    // 3. FEED ARTICLES (Phải đăng nhập) ĐẶT TRÊN GET ':slug'
    @UseGuards(JwtAuthGuard)
    @Get('feed')
    findFeed(@Request() req, @Query() query: QueryArticleDto) {
        return this.articlesService.findFeed(req.user.id, query);
    }

    // 4. GET ARTICLE (Không yêu cầu đăng nhập)
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.articlesService.findOne(slug);
    }

    // 5. UPDATE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Put(':slug')
    update(
        @Param('slug') slug: string,
        @Request() req,
        @Body('article') updateArticleDto: UpdateArticleDto,
    ) {
        return this.articlesService.update(slug, req.user.id, updateArticleDto);
    }

    // 6. DELETE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Delete(':slug')
    remove(@Param('slug') slug: string, @Request() req) {
        return this.articlesService.remove(slug, req.user.id);
    }

    // 7. FAVORITE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Post(':slug/favorite')
    favorite(@Param('slug') slug: string, @Request() req) {
        return this.articlesService.favorite(slug, req.user.id);
    }

    // 8. UNFAVORITE ARTICLE
    @UseGuards(JwtAuthGuard)
    @Delete(':slug/favorite')
    unfavorite(@Param('slug') slug: string, @Request() req) {
        return this.articlesService.unfavorite(slug, req.user.id);
    }
}