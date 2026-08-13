import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('api/articles')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    // 1. ADD COMMENTS TO AN ARTICLE (Yêu cầu đăng nhập)
    @UseGuards(JwtAuthGuard)
    @Post(':slug/comments')
    create(
        @Request() req,
        @Param('slug') slug: string,
        @Body('comment') createCommentDto: CreateCommentDto,
    ) {
        return this.commentsService.create(req.user.id, slug, createCommentDto);
    }

    // 2. GET COMMENTS FROM AN ARTICLE (Khách vãng lai cũng xem được)
    @Get(':slug/comments')
    findByArticle(@Param('slug') slug: string) {
        return this.commentsService.findByArticle(slug);
    }

    // 3. DELETE COMMENT (Yêu cầu đăng nhập)
    @UseGuards(JwtAuthGuard)
    @Delete(':slug/comments/:id')
    async remove(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @I18n() i18n: I18nContext,
    ) {
        await this.commentsService.remove(req.user.id, id);
        return { message: i18n.t('comments.DELETE_SUCCESS') };
    }
}