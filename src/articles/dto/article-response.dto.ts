import { Expose, Type } from 'class-transformer';

export class AuthorResponseDto {
    @Expose()
    username: string;

    @Expose()
    bio: string;

    @Expose()
    image: string;

    @Expose()
    following: boolean;
}

export class ArticleResponseDto {
    @Expose()
    id: number;

    @Expose()
    slug: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    body: string;

    @Expose()
    tagList: string[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    favoritesCount: number;

    @Expose()
    @Type(() => AuthorResponseDto)
    author: AuthorResponseDto;
}
