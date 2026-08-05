import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentsService, ATTACHMENT_REPOSITORY } from './attachments.service';

describe('AttachmentsService', () => {
  let service: AttachmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        { provide: ATTACHMENT_REPOSITORY, useValue: {} }
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
