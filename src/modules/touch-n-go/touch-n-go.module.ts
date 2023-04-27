import { Module } from '@nestjs/common';

import { TouchNGoController } from './controllers/touch-n-go.controller';

@Module({
  controllers: [TouchNGoController]
})
export class TouchNGoModule {}
