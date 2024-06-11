import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import axios, { Axios, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BehaviorSubject, lastValueFrom, map, Observable, Subscription } from 'rxjs';
import { Comment, WeTrackTicket } from '../../models/we-track-ticket.model';

@Injectable()
export class WeTrackService {

  private axiosInstance: AxiosInstance;

  private firebaseIsWorking: boolean = true;
  private readonly timeout: number = 3000;
  private readonly timeoutMessage: string = 'Error: Timeout limit exceeded';
  private readonly standardRequestOptions: Partial<AxiosRequestConfig>;

  private readonly backendUrl: string = "https://atlas-boot-camp-default-rtdb.firebaseio.com/we-track";

  private loadingChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private loading: boolean;
  private httpSubscription: Subscription;
  private isSuccessfullyCompleted: boolean = false;
  private apiUniqueId: number;

  constructor(private http: HttpService) {

    this.standardRequestOptions = {
      timeout: this.timeout,
      timeoutErrorMessage: this.timeoutMessage,
    }

    // this.initTickets();
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

  // public getResults(): WeTrackTicketsObject {
  //   return JSON.parse(JSON.stringify(this.tickets));
  // }

  private async initTickets(): Promise<void> {
    // this.tickets = (await this.callTickets()).tickets;
  }

  private async call(uniqueId: number = -1): Promise<WeTrackResponse> {

    const path = uniqueId === -1 ? '' : '/' + uniqueId.toString();

    try {
      const response = this.http.get(this.backendUrl + path + '.json', this.standardRequestOptions)
        .pipe(map(res => res.data));
      
      const output = await lastValueFrom(response);

      return {
        tickets: uniqueId === -1 ? output : null,
        singleTicket: uniqueId !== -1 ? output : null,
        apiSuccessful: true
      };
    }
    catch(error) {
      console.error(error); 
      this.firebaseIsWorking = false;
      return {
        apiSuccessful: false,
        error: error.error,
      };
    }
  }

  public async callTickets(): Promise<WeTrackResponse> {
    return this.call();
  }

  /**
   * @description Receives a WeTrackTicket and 
   * @param {Partial<WeTrackTicket> & Pick<WeTrackTicket} ticket - A we track ticket with the 
   * @returns 
   */
  public async updateTicket(ticket: Partial<WeTrackTicket> & Pick<WeTrackTicket, 'uniqueId'>): Promise<WeTrackResponse> {

    let ticketPayload: WeTrackTicket = null;

    // Get current ticket from back end
    await this.call(ticket.uniqueId).then( 
      (res: WeTrackResponse) => {
        ticketPayload = res.singleTicket;
      }
    );

    // make changes to ticket based on parameter passed into this method
    for (let key in ticket) {
      ticketPayload[key] = ticket[key];
    }

    // send the updated ticket back to back end
    try {
      const res = this.http.put(`${this.backendUrl}/${ticket.uniqueId}.json`, JSON.stringify(ticketPayload), this.standardRequestOptions)
        .pipe(map(res => res.data));
  
      const output = await lastValueFrom(res);
      return {
        tickets: output, 
        apiSuccessful: true
      };

    }
    catch(error) {
      console.error(error); 
      this.firebaseIsWorking = false;
      return {
        apiSuccessful: false,
        error: error.error,
      };
    }
  }

  public async createTicket(ticket: WeTrackTicket): Promise<WeTrackResponse> {
    try {
      const ticketPayload = ticket;

      const res = this.http.put(`${this.backendUrl}/${ticket.uniqueId}.json`, JSON.stringify(ticketPayload), this.standardRequestOptions)
        .pipe(map(response => response.data));
      
      const output = await lastValueFrom(res);

      return {
        apiSuccessful: true,
      };
    }
    catch(error) {
      console.error(error); 
      this.firebaseIsWorking = false;
      return {
        apiSuccessful: false,
        error: error.error,
      };
    }
  }

  public async deleteTicket(ticketId: number, isDeleted: boolean): Promise<WeTrackResponse> {

    try {
      const res = this.http.put(`${this.backendUrl}/${ticketId}/deleted.json`, `${isDeleted}`, this.standardRequestOptions)
        .pipe(map(response => response.data));
    
      const output = await lastValueFrom(res);

      return {
        apiSuccessful: true,
      };
    }
    catch(error) {
      console.error(error); 
      this.firebaseIsWorking = false;
      return {
        apiSuccessful: false,
        error: error.error,
      };
    }
  }

  public async addComment(uniqueId: number, comment: Comment): Promise<WeTrackResponse> {
    try {
      const res = this.http.put(`${this.backendUrl}/${uniqueId}/comments/${comment.date}.json`, JSON.stringify(comment), this.standardRequestOptions)
        .pipe(map(response => response.data));
    
      const output = await lastValueFrom(res);

      return {
        apiSuccessful: true,
      };

    }
    catch(error) {
      console.error(error); 
      this.firebaseIsWorking = false;
      return {
        apiSuccessful: false,
        error: error.error,
      };
      
    }
  }
}

export interface WeTrackResponse {
  tickets?: WeTrackTicketsObject,
  singleTicket?: WeTrackTicket,
  apiSuccessful: boolean,
  error?: any,
}

export interface WeTrackTicketsObject {
  [key: string]: WeTrackTicket
}