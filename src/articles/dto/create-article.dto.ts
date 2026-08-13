import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateArticleDto {
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
    title: string;

    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
    description: string;

    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
    body: string;

    @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
    @IsOptional()
    tagList?: string[];
}