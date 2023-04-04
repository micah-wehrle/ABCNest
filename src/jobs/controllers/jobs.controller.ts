import { Controller, Get, Post, Param, Body } from '@nestjs/common';

import { TechLoad } from '../models/tech-load.model';

@Controller('/jobs')
export class JobsController {
  @Get('/get/:uuid')
  async getJobsGeneral(@Param('uuid') uuid: string) {
    // await new Promise(resolve => setTimeout(resolve, 1500)); // just adds a delay for feel

    if (!uuid || uuid.length === 0) {
      return {
        'flowStatus': 'FAILURE',
        'flowStatusMessage': 'invalid UUID',
      }
    }

    const jobData = new TechLoad(uuid);


    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'IDK success',
      'jobData': jobData,
    }
  }

  @Get('/get/:uuid/:amount')
  async getJobsSpecific(@Param('uuid') uuid: string, @Param('amount') amount: string) {
    // await new Promise(resolve => setTimeout(resolve, 1500)); // just adds a delay for feel

    if (!uuid || uuid.length === 0) {
      return {
        'flowStatus': 'FAILURE',
        'flowStatusMessage': 'invalid UUID',
      }
    }

    const amountNum: number = Number.parseInt(amount);

    if (!amountNum || typeof amountNum !== 'number' || amountNum <= 0) {
      return {
        'flowStatus': 'FAILURE',
        'flowStatusMessage': 'invalid job amount request',
      }
    }

    const jobData: TechLoad = new TechLoad(uuid, amountNum);


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
