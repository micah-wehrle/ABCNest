import { Controller, Get, Post, Param, Body, Header } from '@nestjs/common';

import { TechLoad } from '../models/tech-load.model';

@Controller('/jobs')
export class JobsController {
  @Get('/get/:uuid')
  async getJobs(@Param('uuid') uuid: string) {
    // await new Promise(resolve => setTimeout(resolve, 1500)); // just adds a delay for feel

    const jobData = new TechLoad(uuid);

    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'IDK success',
      'jobData': jobData,
    }
  }
 
  @Post('/update/:id')
  updateJob(@Body() body: any, @Param('id') id: any) {
    
  }
}
