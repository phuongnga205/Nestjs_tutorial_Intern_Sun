import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryArticleDto {
    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsString()
    author?: string;

    @IsOptional()
    @IsString()
    favorited?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsNumberString()
    offset?: string;
}