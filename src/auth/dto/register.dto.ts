import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail({}, { message: i18nValidationMessage('validation.INVALID_EMAIL') })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  password: string;
}
