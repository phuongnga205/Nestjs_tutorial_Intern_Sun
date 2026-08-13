import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService, ARTICLES_REPOSITORY, USERS_REPOSITORY_IN_ARTICLE } from './articles.service';

describe('ArticlesService', () => {
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: ARTICLES_REPOSITORY, useValue: {} },
        { provide: USERS_REPOSITORY_IN_ARTICLE, useValue: {} }
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
