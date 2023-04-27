import { Test, TestingModule } from '@nestjs/testing';
import { TouchNGoController } from './touch-n-go.controller';

describe('TouchNGoController', () => {
  let controller: TouchNGoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TouchNGoController],
    }).compile();

    controller = module.get<TouchNGoController>(TouchNGoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
