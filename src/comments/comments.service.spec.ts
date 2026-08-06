import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService, COMMENTS_REPOSITORY, ARTICLES_REPOSITORY_IN_COMMENT, USERS_REPOSITORY_IN_COMMENT } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: COMMENTS_REPOSITORY,
          useValue: {},
        },
        {
          provide: ARTICLES_REPOSITORY_IN_COMMENT,
          useValue: {},
        },
        {
          provide: USERS_REPOSITORY_IN_COMMENT,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
