import { Body, Controller, Get, Post } from '@nestjs/common';
import { Comment, WeTrackTicket } from '../models/we-track-ticket.model';
import { WeTrackService, WeTrackTicketsObject } from '../services/we-track/we-track.service';

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
          'tickets': this.removeDeletedTickets(response.tickets),
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
          'tickets': this.removeDeletedTickets(response.tickets),
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
          'tickets': this.removeDeletedTickets(response.tickets),
        }
      });
  
    return output;
  }

  @Post('delete')
  async deleteWeTrackTicket(@Body() body: { ticketId: number, isDeleted: boolean }) {
    let output: any;

    await this.weTrack.deleteTicket(body.ticketId, body.isDeleted)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully updated weTrack ticket' : response.error,
          'tickets': this.removeDeletedTickets(response.tickets),
        }
      });
  
    return output;
  }

  @Post('comment')
  async addWeTrackTicketComment(@Body() body: { ticketId: number, comment: Comment}) {
    
    let output: any;

    await this.weTrack.addComment(body.ticketId, body.comment)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully added weTrack comment' : response.error,
          'tickets': this.removeDeletedTickets(response.tickets),
        }
      });

  }

  @Post('delete-comment')
  async deleteWeTrackTicketComment(@Body() body: {ticketId: number, commentDate: number, isDeleted: boolean}) {
    let output: any;

    await this.weTrack.deleteComment(body.ticketId, body.commentDate, body.isDeleted);
    return {'test': 'testing'};
  }

  @Post('perm-delete')
  async permanentlyDeleteWeTrackTicket(@Body() body: {ticketId: number}) {
    let output: any;
    await this.weTrack.permDeleteTicket(body.ticketId);
    return {};
  }

  @Get('get-deleted')
  async getDeletedTickets() {
    let output: any;

    await this.weTrack.callTickets()
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully retrieved weTrack data' : response.error,
          'tickets': this.removeNonDeletedTickets(response.tickets),
        }
      });
    
    return output;
  }

  private removeDeletedTickets(tickets: WeTrackTicketsObject): WeTrackTicketsObject {
    const output: WeTrackTicketsObject = {};

    for (let key in tickets) {
      const ticket = tickets[key];
      if (!ticket.deleted) {
        delete ticket["deleted"];
        output[key] = this.removeDeletedComments(ticket);
      }
    }

    return output;
  }

  private removeDeletedComments(ticketBase: WeTrackTicket): WeTrackTicket {
    if (!ticketBase.comments || Object.keys(ticketBase.comments).length === 0) {
      return ticketBase;
    }

    const outputComments = {};
    for (let key in ticketBase.comments) {
      if (!ticketBase.comments[key].deleted) {
        outputComments[key] = ticketBase.comments[key];
      }
    }
    const ticket = JSON.parse(JSON.stringify(ticketBase));
    ticket.comments = outputComments;
    return ticket;
  }

  private removeNonDeletedTickets(tickets: WeTrackTicketsObject): WeTrackTicketsObject {
    const output: WeTrackTicketsObject = {};

    for (let key in tickets) {
      const ticket = tickets[key];
      if (ticket.deleted) {
        output[key] = ticket;
      }
    }

    return output;
  }
}