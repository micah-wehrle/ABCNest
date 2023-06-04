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
        'flowStatusMessage': `${!uuid ? 'Please pass' : `${uuid} is not`} a valid uuid. Must be 6 characters: 2 letters, 3 digits, and then a letter or digit.`,
      }
    }

    // Pass the amount whether it exists or not. TechLoad handles NaN (falsy) or an actual number
    const jobData: TechLoad = new TechLoad(uuid, Number.parseInt(amount));
    
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': `Successfully generated job data from uuid ${uuid}`,
      'jobs': jobData.jobs // only passes array of jobs to save on response packet size
    }
  }
}
