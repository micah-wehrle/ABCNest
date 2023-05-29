import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/guards/auth.guard';

@UseGuards(new AuthGuard()) // Add guard here!
@Controller('/jobs')
export class JobsController {
  @Get('/get/:uuid')
  async getJobs(@Param('uuid') uuid: string) {
    // await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'Successfully transmitted UUID.',
      'data': uuid,
    }
  }
}
