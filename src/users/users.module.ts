import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UsersService, USERS_REPOSITORY } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AttachmentsModule } from '../attachments/attachments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Cấp quyền dùng bảng User
    AttachmentsModule,                // Mượn logic lưu file từ Attachments
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useExisting: getRepositoryToken(User),
    },
    UsersService
  ],
  exports: [UsersService],
})
export class UsersModule { }