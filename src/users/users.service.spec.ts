import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, USERS_REPOSITORY } from './users.service';
import { AttachmentsService } from '../attachments/attachments.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: {} },
        { provide: AttachmentsService, useValue: {} }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
