import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../auth/dto/user-response.dto';

export class CommentResponseDto {
    @Expose()
    id: number;

    @Expose()
    body: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    @Type(() => UserResponseDto)
    author: UserResponseDto;
}
