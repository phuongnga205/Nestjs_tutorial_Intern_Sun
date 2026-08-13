import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AttachmentsModule } from '../attachments/attachments.module';
import { Attachment } from '../attachments/entities/attachment.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Attachment]), // Cấp quyền dùng bảng User và Attachment
    AttachmentsModule, // Mượn logic lưu file từ Attachments
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: 'USERS_REPOSITORY',
      useExisting: getRepositoryToken(User),
    },
    {
      provide: 'ATTACHMENT_REPOSITORY',
      useExisting: getRepositoryToken(Attachment),
    },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
