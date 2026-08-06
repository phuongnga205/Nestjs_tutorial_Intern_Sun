import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCommentDto {
    @IsString({ message: i18nValidationMessage('validation.STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
    body: string;
}