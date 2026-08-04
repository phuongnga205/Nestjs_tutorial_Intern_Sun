import { Injectable, Inject } from '@nestjs/common';


export const ATTACHMENT_REPOSITORY = 'ATTACHMENT_REPOSITORY';

@Injectable()
export class AttachmentsService {
    constructor(
        @Inject(ATTACHMENT_REPOSITORY)
        private readonly attachmentRepository: any,
    ) { }

    // Hàm này sẽ được gọi khi User upload ảnh thành công
    async saveAttachmentData(file: Express.Multer.File, entityId: number, entityType: string) {
        // Tạo đường dẫn public để web có thể đọc được ảnh; Ví dụ: file được lưu ở ./public/uploads/avatar-123.jpg
        // URL trả về sẽ là: /public/uploads/avatar-123.jpg
        const fileUrl = `/public/uploads/${file.filename}`;

        // Tạo bản ghi mới để chuẩn bị lưu xuống DB
        const newAttachment = this.attachmentRepository.create({
            url: fileUrl,
            file_name: file.filename,
            file_type: file.mimetype,
            file_size: file.size,
            entity_id: entityId,
            entity_type: entityType,
        });

        // Lưu xuống DB và trả về URL để User Service dùng
        await this.attachmentRepository.save(newAttachment);
        return fileUrl;
    }
}