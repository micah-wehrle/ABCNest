import { Test, TestingModule } from '@nestjs/testing';
import { WeTrackController } from './we-track.controller';

describe('WeTrackController', () => {
  let controller: WeTrackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeTrackController],
    }).compile();

    controller = module.get<WeTrackController>(WeTrackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
