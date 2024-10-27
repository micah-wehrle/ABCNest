import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
          'tickets': this.removeDeletedTickets(response.ticketGroups),
        }
      });
    
    return output;
  }

  @Post('create/:group')
  async createWeTrackTicket(@Body() body: WeTrackTicket, @Param('group') ticketGroup: string) {
    let output: any;

    await this.weTrack.createTicket(body, ticketGroup)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully updated weTrack ticket' : response.error,
          'tickets': this.removeDeletedTickets(response.ticketGroups),
        }
      });
    
      return output;
  }

  // TODO: Check on typing body
  @Post('update/:group')
  async updateWeTrackTicket(@Body() body: Partial<WeTrackTicket> & Pick<WeTrackTicket, 'uniqueId'>, @Param('group') ticketGroup: string) {
    let output: any;

    await this.weTrack.updateTicket(body, ticketGroup)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully updated weTrack ticket' : response.error,
          'tickets': this.removeDeletedTickets(response.ticketGroups),
        }
      });
  
    return output;
  }

  @Post('delete/:group')
  async deleteWeTrackTicket(@Body() body: { ticketId: number, isDeleted: boolean }, @Param('group') ticketGroup: string) {
    let output: any;

    await this.weTrack.deleteTicket(body.ticketId, ticketGroup, body.isDeleted)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully updated weTrack ticket' : response.error,
          'tickets': this.removeDeletedTickets(response.ticketGroups),
        }
      });
  
    return output;
  }

  @Post('comment/:group')
  async addWeTrackTicketComment(@Body() body: { ticketId: number, comment: Comment}, @Param('group') ticketGroup: string) {
    
    let output: any;

    await this.weTrack.addComment(body.ticketId, ticketGroup, body.comment)
      .then((response) => {
        output = {
          'flowStatus': 'SUCCESS',
          'flowStatusMessage': response.apiSuccessful ? 'Successfully added weTrack comment' : response.error,
          'tickets': this.removeDeletedTickets(response.ticketGroups),
        }
      });
      return output;
  }

  @Post('delete-comment/:group')
  async deleteWeTrackTicketComment(@Body() body: {ticketId: number, commentDate: number, isDeleted: boolean}, @Param('group') ticketGroup: string) {
    let output: any;

    await this.weTrack.deleteComment(body.ticketId, ticketGroup, body.commentDate, body.isDeleted);
    return {'test': 'testing'};
  }

  @Post('perm-delete/:group')
  async permanentlyDeleteWeTrackTicket(@Body() body: {ticketId: number}, @Param('group') ticketGroup: string) {
    let output: any;
    await this.weTrack.permDeleteTicket(body.ticketId, ticketGroup);
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
          'tickets': this.removeNonDeletedTickets(response.ticketGroups),
        }
      });
    
    return output;
  }

  private removeDeletedTickets(ticketGroups: WeTrackTicketsObject): WeTrackTicketsObject {
    const output: WeTrackTicketsObject = {};
    for (let groupName in ticketGroups) {
      output[groupName] = {};
      for (let key in ticketGroups[groupName]) {
        const ticket = ticketGroups[groupName][key];
        if (!ticket.deleted) {
          delete ticket["deleted"];
          output[groupName][key] = this.removeDeletedComments(ticket);
        }
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

  private removeNonDeletedTickets(ticketGroups: WeTrackTicketsObject): WeTrackTicketsObject {
    // const output: WeTrackTicketsObject = {};

    // for (let key in tickets) {
    //   const ticket = tickets[key];
    //   if (ticket.deleted) {
    //     output[key] = ticket;
    //   }
    // }

    // return output;


    const output: WeTrackTicketsObject = {};
    for (let groupName in ticketGroups) {
      output[groupName] = {};
      for (let key in ticketGroups[groupName]) {
        const ticket = ticketGroups[groupName][key];
        if (ticket.deleted) {
          output[groupName][key] = this.removeDeletedComments(ticket);
        }
      }
    }

    return output;
  }
}