import { Controller, Get, Post, Param, Body } from '@nestjs/common';

import { TechLoad } from '../models/tech-load.model';

@Controller('/jobs')
export class JobsController {
  @Get(['get/:uuid', '/get/:uuid/:amount'])
  async getJobsSpecific(@Param('uuid') uuid: string, @Param('amount') amount: string) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // just adds a delay for feel

    if (!uuid || uuid.length === 0) {
      return {
        'flowStatus': 'FAILURE',
        'flowStatusMessage': 'invalid UUID',
      }
    }

    const jobData: TechLoad = new TechLoad(uuid, Number.parseInt(amount));

    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'IDK success',
      'jobData': jobData,
    }
  }
}