import { Controller, Get } from '@nestjs/common';

@Controller('we-track')
export class WeTrackController {
  @Get('get')
  async getWeTracks() {
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'Successfully retrieved weTrack data',
    }
  }
}
