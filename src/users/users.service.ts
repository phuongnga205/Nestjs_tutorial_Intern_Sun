import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';

import { AttachmentsService } from '../attachments/attachments.service';

export enum AttachmentType {
    USER_AVATAR = 'user_avatar',
    ARTICLE_IMAGE = 'article_image',
}

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

@Injectable()
export class UsersService {
    constructor(
        @Inject(USERS_REPOSITORY)
        private readonly userRepo: any,
        @Inject(AttachmentsService)
        private readonly attachmentsService: any,
    ) { }

    // 1. API UPDATE USER PROFILE (Kèm Upload Ảnh)
    async updateUser(userId: number, file: Express.Multer.File, updateData: any) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('Không tìm thấy User');

        // Nếu có file ảnh đính kèm từ Postman
        if (file) {
            const imageUrl = await this.attachmentsService.saveAttachmentData(
                file,
                user.id,
                AttachmentType.USER_AVATAR // Đã thay thế chuỗi hardcode bằng Enum
            );
            user.image = imageUrl; // Cập nhật link ảnh cho user
        }

        // Cập nhật các thông tin khác
        if (updateData?.bio) user.bio = updateData.bio;
        if (updateData?.username) user.username = updateData.username;

        await this.userRepo.save(user);

        return {
            user: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                image: user.image,
            },
        };
    }

    // 2. API GET PROFILE
    async getProfile(currentUserId: number, targetUsername: string) {
        const targetUser = await this.userRepo.findOne({ 
            where: { username: targetUsername },
            relations: { followers: true }
        });

        if (!targetUser) throw new NotFoundException('Không tìm thấy người dùng này');

        // Đảm bảo mảng followers không bị undefined
        const followersList = targetUser.followers || [];
        const isFollowing = followersList.some((follower: any) => follower.id === currentUserId);

        return {
            profile: {
                username: targetUser.username,
                bio: targetUser.bio,
                image: targetUser.image,
                following: isFollowing,
            },
        };
    }

    // 3. API FOLLOW USER
    async followUser(currentUserId: number, targetUsername: string) {
        if (currentUserId.toString() === targetUsername) {
            throw new BadRequestException('Bạn không thể tự follow chính mình');
        }

        const currentUser = await this.userRepo.findOne({
            where: { id: currentUserId },
            relations: { following: true }
        });

        // Bắt buộc kiểm tra null để TypeScript cho phép xử lý mảng
        if (!currentUser) throw new NotFoundException('Không tìm thấy User hiện tại');

        const targetUser = await this.userRepo.findOne({ where: { username: targetUsername } });
        if (!targetUser) throw new NotFoundException('Không tìm thấy người dùng này');

        const followingList = currentUser.following || [];
        const isAlreadyFollowing = followingList.some((user: any) => user.id === targetUser.id);

        if (!isAlreadyFollowing) {
            currentUser.following = [...followingList, targetUser];
            await this.userRepo.save(currentUser);
        }

        return await this.getProfile(currentUserId, targetUsername);
    }

    // 4. API UNFOLLOW USER
    async unfollowUser(currentUserId: number, targetUsername: string) {
        const currentUser = await this.userRepo.findOne({
            where: { id: currentUserId },
            relations: { following: true }
        });

        if (!currentUser) throw new NotFoundException('Không tìm thấy User hiện tại');

        const targetUser = await this.userRepo.findOne({ where: { username: targetUsername } });
        if (!targetUser) throw new NotFoundException('Không tìm thấy người dùng này');

        if (currentUser.following) {
            // Lọc người đó ra khỏi mảng following
            currentUser.following = currentUser.following.filter((user: any) => user.id !== targetUser.id);
            await this.userRepo.save(currentUser);
        }

        return await this.getProfile(currentUserId, targetUsername);
    }
}