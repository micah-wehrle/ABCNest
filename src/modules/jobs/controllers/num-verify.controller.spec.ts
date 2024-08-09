import { Test, TestingModule } from '@nestjs/testing';
import { NumVerifyController } from './num-verify.controller';

describe('NumVerifyController', () => {
  let controller: NumVerifyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NumVerifyController],
    }).compile();

    controller = module.get<NumVerifyController>(NumVerifyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
