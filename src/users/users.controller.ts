import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../utils/multer.config';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: number; username: string };
}

const MAX_FILE_SIZE = 10485760;

@Controller('profiles') // Base route theo chuẩn Spec của Medium Clone
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Cập nhật hồ sơ và ảnh đại diện
  @UseGuards(JwtAuthGuard)
  @Put('update')
  @UseInterceptors(
    FileInterceptor('image', { ...multerOptions, limits: { fileSize: MAX_FILE_SIZE } }),
  )
  async updateUser(
    @Request() req: AuthenticatedRequest,
    @Body() updateData: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.updateUser(req.user.id, file, updateData);
  }

  // 2. Lấy thông tin hồ sơ
  @UseGuards(JwtAuthGuard)
  @Get(':username')
  async getProfile(
    @Request() req: AuthenticatedRequest,
    @Param('username') username: string,
  ) {
    return this.usersService.getProfile(req.user.id, username);
  }

  // 3. Theo dõi người dùng
  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  async followUser(
    @Request() req: AuthenticatedRequest,
    @Param('username') username: string,
  ) {
    return this.usersService.followUser(req.user.id, username);
  }

  // 4. Bỏ theo dõi người dùng
  @UseGuards(JwtAuthGuard)
  @Delete(':username/follow')
  async unfollowUser(
    @Request() req: AuthenticatedRequest,
    @Param('username') username: string,
  ) {
    return this.usersService.unfollowUser(req.user.id, username);
  }
}
