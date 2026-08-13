import { Injectable, BadRequestException } from '@nestjs/common';
import { Attachment } from './entities/attachment.entity';
import { IDataAccessorContext } from '../database/data-accessor.provider';

@Injectable()
export class AttachmentsService {
  async saveAttachmentData(
    file: Express.Multer.File,
    entityId: number,
    entityType: string,
    txn: IDataAccessorContext,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const relativePath = file.path.replace(/\\/g, '/');
    const publicUrl = `/${relativePath}`;

    const existingAttachment = await txn.fetchRecord(Attachment, {
      where: { entity_id: entityId, entity_type: entityType },
    });

    if (existingAttachment) {
      await txn.archiveRecord(Attachment, existingAttachment);
    }

    const newAttachment = txn.buildRecord(Attachment, {
      url: publicUrl,
      entity_id: entityId,
      entity_type: entityType,
      file_size: file.size,
      file_type: file.mimetype,
      file_name: file.filename,
    });

    await txn.storeRecord(Attachment, newAttachment);

    return publicUrl;
  }
}
