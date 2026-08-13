import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { t } from '../utils/i18n.util';

import { AttachmentsService } from '../attachments/attachments.service';
import { DataAccessorProvider, IDataAccessorContext } from '../database/data-accessor.provider';
import { Attachment } from '../attachments/entities/attachment.entity';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  @Inject(ConfigService)
  private readonly configService!: ConfigService;

  @Inject(DataAccessorProvider)
  private readonly dataAccessor!: DataAccessorProvider;

  @Inject(AttachmentsService)
  private readonly attachmentsService!: AttachmentsService;

  private getFullUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
    const path = url.startsWith('/') ? url : `/${url}`;
    
    return `${baseUrl}${path}`;
  }

  async updateUser(
    userId: number,
    file: Express.Multer.File,
    updateData: UpdateUserDto,
  ) {
    return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
      const user = await txn.fetchRecord(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(t('users.USER_NOT_FOUND'));
      }

      let imageUrl: string | null = null;
      if (file) {
        imageUrl = await this.attachmentsService.saveAttachmentData(
          file,
          user.id,
          'user_avatar',
          txn,
        );
      }

      if (updateData?.bio) user.bio = updateData.bio;
      if (updateData?.username) user.username = updateData.username;

      await txn.storeRecord(User, user);

      if (!imageUrl) {
        const attachment = await txn.fetchRecord(Attachment, {
          where: {
            entity_id: user.id,
            entity_type: 'user_avatar',
          },
        });
        imageUrl = attachment ? attachment.url : null;
      }

      return {
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: this.getFullUrl(imageUrl),
      };
    });
  }

  async getProfile(currentUserId: number, targetUsername: string) {
    return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
      const targetUser = await txn.fetchRecord(User, {
        where: { username: targetUsername },
        relations: { followers: true },
      });

      if (!targetUser) {
        throw new NotFoundException(t('users.USER_NOT_FOUND'));
      }

      const followersList = targetUser.followers || [];
      const isFollowing = followersList.some(
        (follower: User) => follower.id === currentUserId,
      );

      const attachment = await txn.fetchRecord(Attachment, {
        where: {
          entity_id: targetUser.id,
          entity_type: 'user_avatar',
        },
      });

      return {
        username: targetUser.username,
        bio: targetUser.bio,
        image: attachment ? this.getFullUrl(attachment.url) : null,
        following: isFollowing,
      };
    });
  }

  async followUser(currentUserId: number, targetUsername: string) {
    return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
      if (currentUserId.toString() === targetUsername) {
        throw new BadRequestException(t('users.CANNOT_FOLLOW_SELF'));
      }

      const currentUser = await txn.fetchRecord(User, {
        where: { id: currentUserId },
        relations: { following: true },
      });

      if (!currentUser) {
        throw new NotFoundException(t('users.CURRENT_USER_NOT_FOUND'));
      }

      const targetUser = await txn.fetchRecord(User, {
        where: { username: targetUsername },
      });
      if (!targetUser) {
        throw new NotFoundException(t('users.USER_NOT_FOUND'));
      }

      const followingList = currentUser.following || [];
      const isAlreadyFollowing = followingList.some(
        (user: User) => user.id === targetUser.id,
      );

      if (!isAlreadyFollowing) {
        currentUser.following = [...followingList, targetUser];
        await txn.storeRecord(User, currentUser);
      }

      return this.getProfile(currentUserId, targetUsername);
    });
  }

  async unfollowUser(currentUserId: number, targetUsername: string) {
    return this.dataAccessor.execute(async (txn: IDataAccessorContext) => {
      const currentUser = await txn.fetchRecord(User, {
        where: { id: currentUserId },
        relations: { following: true },
      });

      if (!currentUser) {
        throw new NotFoundException(t('users.CURRENT_USER_NOT_FOUND'));
      }

      const targetUser = await txn.fetchRecord(User, {
        where: { username: targetUsername },
      });
      if (!targetUser) {
        throw new NotFoundException(t('users.USER_NOT_FOUND'));
      }

      if (currentUser.following) {
        currentUser.following = currentUser.following.filter(
          (user: User) => user.id !== targetUser.id,
        );
        await txn.storeRecord(User, currentUser);
      }

      return this.getProfile(currentUserId, targetUsername);
    });
  }
}
