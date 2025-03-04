import { Test, TestingModule } from '@nestjs/testing';
import { TastingsService } from './tastings.service';

describe('TastingsService', () => {
  let service: TastingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TastingsService],
    }).compile();

    service = module.get<TastingsService>(TastingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
