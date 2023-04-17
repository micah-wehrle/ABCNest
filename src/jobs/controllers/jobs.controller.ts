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

  @Get('/wetrack/get/')
  async getWeTrack() {
    /*
      Pull data from firebase
        send auth data
        get all data
      Send data to front end
      Micah needs to watch videos for this!
    */
  }

  @Get('wetrack/check/:repo/:branch')
  async checkWeTrack(@Param('repo') repoName: string, @Param('branch') branchName: string) {
    
  }
 
  @Post('/update/:id')
  updateJob(@Body() body: any, @Param('id') id: any) {
    
  }
}
