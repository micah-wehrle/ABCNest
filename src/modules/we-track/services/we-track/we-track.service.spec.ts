import { Test, TestingModule } from '@nestjs/testing';
import { WeTrackService } from './we-track.service';

describe('WeTrackService', () => {
  let service: WeTrackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeTrackService],
    }).compile();

    service = module.get<WeTrackService>(WeTrackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
