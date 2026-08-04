import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AttachmentsService, ATTACHMENT_REPOSITORY } from './attachments.service';
import { Attachment } from './entities/attachment.entity';

@Module({
  // Đăng ký entity Attachment vào hệ thống TypeORM của module
  imports: [TypeOrmModule.forFeature([Attachment])],
  providers: [
    {
      provide: ATTACHMENT_REPOSITORY,
      useExisting: getRepositoryToken(Attachment),
    },
    AttachmentsService
  ],
  // Export service ra ngoài để UsersModule có thể dùng để lưu file avatar
  exports: [AttachmentsService],
})
export class AttachmentsModule { }