import { Test, TestingModule } from '@nestjs/testing';
import { AbstractDatabaseService } from './abstract-database.service';

describe('AbstractDatabaseService', () => {
  let service: AbstractDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbstractDatabaseService],
    }).compile();

    service = module.get<AbstractDatabaseService>(AbstractDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
