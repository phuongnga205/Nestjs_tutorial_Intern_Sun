import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { I18nContext } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { CommentResponseDto } from './dto/comment-response.dto';


export const COMMENTS_REPOSITORY = 'COMMENTS_REPOSITORY';
export const ARTICLES_REPOSITORY_IN_COMMENT = 'ARTICLES_REPOSITORY_IN_COMMENT';
export const USERS_REPOSITORY_IN_COMMENT = 'USERS_REPOSITORY_IN_COMMENT';

@Injectable()
export class CommentsService {
    constructor(
        @Inject(COMMENTS_REPOSITORY)
        private readonly commentRepository: any,
        @Inject(ARTICLES_REPOSITORY_IN_COMMENT)
        private readonly articleRepository: any,
        @Inject(USERS_REPOSITORY_IN_COMMENT)
        private readonly userRepository: any,
    ) { }

    private formatResponse(commentOrComments: any) {
        return plainToInstance(CommentResponseDto, commentOrComments, { excludeExtraneousValues: true });
    }

    // 1. THÊM BÌNH LUẬN VÀO BÀI VIẾT
    async create(userId: number, slug: string, createCommentDto: CreateCommentDto) {
        const author = await this.userRepository.findOne({ where: { id: userId } });
        if (!author) throw new NotFoundException(I18nContext.current()!.t('comments.NOT_FOUND_USER'));

        const article = await this.articleRepository.findOne({ where: { slug } });
        if (!article) throw new NotFoundException(I18nContext.current()!.t('comments.NOT_FOUND_ARTICLE'));

        const comment = this.commentRepository.create({
            body: createCommentDto.body,
            author: author,
            article: article,
        });

        await this.commentRepository.save(comment);

        return { comment: this.formatResponse(comment) };
    }

    // 2. LẤY TẤT CẢ BÌNH LUẬN CỦA 1 BÀI VIẾT
    async findByArticle(slug: string) {
        const article = await this.articleRepository.findOne({ where: { slug } });
        if (!article) throw new NotFoundException(I18nContext.current()!.t('comments.NOT_FOUND_ARTICLE'));

        const comments = await this.commentRepository.find({
            where: { article: { id: article.id } },
            order: { createdAt: 'DESC' },
        });

        return { comments: this.formatResponse(comments) };
    }

    // 3. XÓA BÌNH LUẬN
    async remove(userId: number, commentId: number) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: { author: true },
        });

        if (!comment) throw new NotFoundException(I18nContext.current()!.t('comments.NOT_FOUND_COMMENT'));

        if (comment.author.id !== userId) {
            throw new ForbiddenException(I18nContext.current()!.t('comments.FORBIDDEN_DELETE'));
        }

        await this.commentRepository.remove(comment);
    }
}