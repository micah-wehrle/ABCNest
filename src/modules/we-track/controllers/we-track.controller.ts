import { Body, Controller, Get, Post } from '@nestjs/common';
import { WeTrackTicket } from '../models/we-track-ticket.model';
import { WeTrackService } from '../services/we-track/we-track.service';

@Controller('we-track')
export class WeTrackController {

  constructor(private weTrack: WeTrackService) {}

  @Get('get')
  async getWeTracks() {

    let output: any;

    await this.weTrack.callTickets()
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully retrieved weTrack data' : response.error,
          'tickets': response.tickets,
        }
      });
    
    return output;
  }

  @Post('create')
  async createWeTrackTicket(@Body() body: WeTrackTicket) {
    let output: any;

    await this.weTrack.createTicket(body)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully updated weTrack ticket' : response.error,
          'tickets': response.tickets,
        }
      });
    
      return output;
  }

  // TODO: Check on typing body
  @Post('update')
  async updateWeTrackTicket(@Body() body: Partial<WeTrackTicket> & Pick<WeTrackTicket, 'uniqueId'>) {
    let output: any;

    await this.weTrack.updateTicket(body)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully updated weTrack ticket' : response.error,
          'tickets': response.tickets,
        }
      });
  
    return output;
  }

  @Post('delete')
  async deleteWeTrackTicket() {

  }
}