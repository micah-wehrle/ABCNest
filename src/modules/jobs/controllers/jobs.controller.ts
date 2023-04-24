import { Controller, Get, Post, Param, Body, Header } from '@nestjs/common';

@Controller('/jobs')
export class JobsController {
  @Get('/get/:uuid')
  async getJobs(@Param('uuid') uuid: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'IDK success',
      'data': uuid,
    }
  }
}
