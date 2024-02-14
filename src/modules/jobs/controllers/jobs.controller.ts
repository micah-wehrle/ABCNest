import { Controller, Get, Param } from '@nestjs/common';

import { TechLoad } from '../models/tech-load.model';

@Controller('/jobs')
export class JobsController {
  @Get(['', 'get/'])
  async invalidUuidGetRequest() { // In the event the front end request neglects get or the :uuid
    return {
      'flowStatus': 'FAILURE',
      'flowStatusMessage': "Invalid request path. Path must include 'jobs/get/:uuid'"
    }
  }
  @Get(['get/:uuid', '/get/:uuid/:amount'])
  async getJobsSpecific(@Param('uuid') uuid: string, @Param('amount') amount: string) {
    await new Promise(resolve => setTimeout(resolve, 500)); // just adds a delay for feel so request isn't instantaneous.
    
    if (!uuid || !uuid.match(/^[a-z]{2}\d{3}[a-z\d]$/i)) { // regex checks for valid uuid
      return {
        'flowStatus': 'FAILURE',
        'flowStatusMessage': `Invalid uuid`,
      }
    }

    // Doesn't matter if amount is undefined or a non-number, parseInt will just return NaN which is then handled by TechLoad. The second value is an optional variable so in the case that amount is NaN then it is still handled the same, as a falsy value.
    const jobData: TechLoad = new TechLoad(uuid, Number.parseInt(amount));
    
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': '',
      'jobs': jobData.jobs // only passes array of jobs to save on response packet size
    }
  }
}
