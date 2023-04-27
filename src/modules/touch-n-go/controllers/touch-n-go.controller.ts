import { Controller, Get } from '@nestjs/common';

@Controller('/touch-n-go')
export class TouchNGoController {
  @Get('/get')
  async bothTouchAndAlsoGo() {
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'You are now connected with a tech!'
    }
  }
}
