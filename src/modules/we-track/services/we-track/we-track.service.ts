import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios, { Axios, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BehaviorSubject, lastValueFrom, map, Observable, Subscription } from 'rxjs';
import { WeTrackTicket } from '../../models/we-track-ticket.model';

@Injectable()
export class WeTrackService {

  private axiosInstance: AxiosInstance;

  private firebaseIsWorking: boolean = true;
  private readonly timeout: number = 3000;
  private readonly timeoutMessage: string = 'Error: Timeout limit exceeded';
  private readonly standardRequestOptions: Partial<AxiosRequestConfig>;

  private readonly backendUrl: string = "https://atlas-boot-camp-default-rtdb.firebaseio.com/we-track.json";

  private loadingChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private loading: boolean;
  private httpSubscription: Subscription;
  private isSuccessfullyCompleted: boolean = false;
  private apiUniqueId: number;

  private tickets: WeTrackTicket[];

  constructor(private http: HttpService) {

    this.standardRequestOptions = {
      timeout: this.timeout,
      timeoutErrorMessage: this.timeoutMessage,
    }

    this.initTickets();
  }

  public getLoading(): Observable<boolean> {
    return this.loadingChanged.asObservable();
  }

  public getSub(): Subscription {
    return this.httpSubscription;
  }

  private updateLoading(loading: boolean): void {
    this.loading = loading;
    this.loadingChanged.next(this.loading);
  }

  public hasSuccessfullyCompleted(): boolean {
    return this.isSuccessfullyCompleted;
  }

  public getResults(): WeTrackTicket[] {
    return this.tickets.slice();
  }

  private async initTickets(): Promise<void> {
    this.tickets = (await this.callTickets()).tickets;
  }

  public async callTickets(): Promise<WeTrackResponse> {
    try {
      const response = this.http.get(this.backendUrl, this.standardRequestOptions)
        .pipe(map(res => res.data));
      
      const output = await lastValueFrom(response);

      this.tickets = this.removeDeletedTickets(output);
      return {
        tickets: this.tickets,
        apiSuccessful: true
      };
    }
    catch(error) {
      this.tickets = this.buildFakeTickets();
      this.firebaseIsWorking = false;
      return {
        tickets: this.tickets,
        apiSuccessful: false,
      };
    }
  }

  /**
   * @description Receives a WeTrackTicket and 
   * @param {Partial<WeTrackTicket> & Pick<WeTrackTicket} ticket - A we track ticket with the 
   * @returns 
   */
  public async updateTicket(ticket: Partial<WeTrackTicket> & Pick<WeTrackTicket, 'uniqueId'>): Promise<WeTrackResponse> {
    let tickets = JSON.parse(JSON.stringify((this.tickets)));

    console.log(tickets);
    console.log(ticket);

    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].uniqueId === ticket.uniqueId) {
        for (let key in ticket) {
          tickets[i][key] = ticket[key];
        }
        break;
      }
    }

    try {
      const res = this.http.put(this.backendUrl, JSON.stringify(tickets), this.standardRequestOptions)
        .pipe(map(res => res.data));
  
      const output = await lastValueFrom(res);
      return {
        tickets: this.removeDeletedTickets(output),
        apiSuccessful: true
      };

    }
    catch(error) {
      console.error(error); 
      this.firebaseIsWorking = false;
      return {
        tickets: this.tickets,
        apiSuccessful: false,
        error: error.error,
      };
    }
  }

  public async createTicket(ticket: WeTrackTicket): Promise<WeTrackResponse> {
    try {
      const ticketPayload = [...this.tickets, ticket];

      const res = this.http.put(this.backendUrl, JSON.stringify(ticketPayload), this.standardRequestOptions)
        .pipe(map(response => response.data));
      
      const output = await lastValueFrom(res);

      this.tickets = this.removeDeletedTickets(output);

      return {
        tickets: this.tickets,
        apiSuccessful: true,
      };
    }
    catch(error) {

      this.tickets = [...this.tickets, ticket];
      this.firebaseIsWorking = false;

      return {
        tickets: this.tickets,
        apiSuccessful: false,
        error: error.error
      };
    }
  }

  private removeDeletedTickets(tickets: WeTrackTicket[]): WeTrackTicket[] {

    const output: WeTrackTicket[] = [];

    for (let ticket of tickets) {
      if (!ticket.deleted) {
        delete ticket["deleted"];
        output.push(ticket);
      }
    }

    return output;
  }

  private buildFakeTickets(): WeTrackTicket[] {
    return [
      {
        title: 'FAKE TICKET',
        type: WeTrackTicket.STATIC_DATA.TYPE.ISSUE,
        description: 'This is a fake ticket, which likely has been generated because the database API is not working for whatever reason.',
        submitter: 'Micah',
        assignee: '',
        importance: WeTrackTicket.STATIC_DATA.PRIORITY.LOW,
        status: WeTrackTicket.STATIC_DATA.STATUS.PENDING,
        creationDate: new Date("01/01/1970"),
        editDate: null,
        comments: [],
        tags: [],
        deleted: false,
        uniqueId: 0,
      },
      {
        title: 'Api Monitor Page',
        type: WeTrackTicket.STATIC_DATA.TYPE.FEATURE,
        description: 'Create a view, accessed by the sidebar menu, which displays info about all of our api service files. When a servici',
        submitter: 'Micah',
        assignee: 'Brandon',
        importance: WeTrackTicket.STATIC_DATA.PRIORITY.LOW,
        status: WeTrackTicket.STATIC_DATA.STATUS.ASSIGNED,
        creationDate: new Date("03/26/2024"),
        editDate: null,
        comments: [],
        tags: [],
        deleted: false,
        uniqueId: 1,
      },

      {
        title: 'Finish weTrack',
        type: WeTrackTicket.STATIC_DATA.TYPE.FEATURE,
        description: 'Create weTrack on the band and front ends so that when any user loads the weTrack page they can have access to all the current tickets.',
        submitter: 'Micah',
        assignee: 'Micah',
        importance: WeTrackTicket.STATIC_DATA.PRIORITY.HIGH,
        status: WeTrackTicket.STATIC_DATA.STATUS.ASSIGNED,
        creationDate: new Date("04/02/2024"),
        editDate: null,
        comments: [],
        tags: [],
        deleted: false,
        uniqueId: 2
      }
    ]
  }
}

export interface WeTrackResponse {
  tickets: WeTrackTicket[],
  apiSuccessful: boolean,
  error?: any,
}