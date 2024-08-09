import { Test, TestingModule } from '@nestjs/testing';
import { NumVerifyService } from './num-verify.service';

describe('NumVerifyService', () => {
  let service: NumVerifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NumVerifyService],
    }).compile();

    service = module.get<NumVerifyService>(NumVerifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
