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
  private readonly timeoutMessage: string = 'ABC Error: Timeout limit exceeded';
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

  // async init() {

  //   const res = this.http.put(this.backendUrl + '.json', JSON.stringify( { 'we-track': (await this.call()).ticketGroups } ), this.standardRequestOptions);

  //   console.log(await lastValueFrom(res));
  // }

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

  private async call(uniqueId: number = -1, ticketGroup?: string): Promise<WeTrackResponse> {

    if (uniqueId !== -1 && !ticketGroup) {
      throw new Error('Need to supply ticket group when unique ID is provided')
    }

    const path = uniqueId === -1 ? '' : `/${ticketGroup}/` + uniqueId.toString();

    try {
      const response = this.http.get(this.backendUrl + path + '.json', this.standardRequestOptions)
        .pipe(map(res => res.data));
      
      const output = await lastValueFrom(response);

      return {
        ticketGroups: uniqueId === -1 ? output : null,
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
   * @param {Partial<WeTrackTicket> & Pick<WeTrackTicket>} ticket - A we track ticket with the 
   * @returns 
   */
  public async updateTicket(ticket: Partial<WeTrackTicket> & Pick<WeTrackTicket, 'uniqueId'>, ticketGroup: string): Promise<WeTrackResponse> {
    let ticketPayload: WeTrackTicket = null;

    // Get current ticket from back end
    await this.call(ticket.uniqueId, ticketGroup).then( 
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
      const res = this.http.put(`${this.backendUrl}/${ticketGroup}/${ticket.uniqueId}.json`, JSON.stringify(ticketPayload), this.standardRequestOptions)
        .pipe(map(res => res.data));
  
      const output = await lastValueFrom(res);
      return {
        ticketGroups: output, 
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

  public async createTicket(ticket: WeTrackTicket, ticketGroup: string): Promise<WeTrackResponse> {
    try {
      const ticketPayload = ticket;

      const res = this.http.put(`${this.backendUrl}/${ticketGroup}/${ticket.uniqueId}.json`, JSON.stringify(ticketPayload), this.standardRequestOptions)
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

  public async deleteTicket(ticketId: number, ticketGroup: string, isDeleted: boolean): Promise<WeTrackResponse> {

    try {
      const res = this.http.put(`${this.backendUrl}/${ticketGroup}/${ticketId}/deleted.json`, `${isDeleted}`, this.standardRequestOptions)
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

  public async addComment(uniqueId: number, ticketGroup: string, comment: Comment): Promise<WeTrackResponse> {
    try {
      const res = this.http.put(`${this.backendUrl}/${ticketGroup}/${uniqueId}/comments/${comment.date}.json`, JSON.stringify(comment), this.standardRequestOptions)
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

  public async deleteComment(uniqueId: number, ticketGroup:string, commentDate: number, isDeleted: boolean) {
    try {
      const res = this.http.put(`${this.backendUrl}/${ticketGroup}/${uniqueId}/comments/${commentDate}/deleted.json`, JSON.stringify(isDeleted), this.standardRequestOptions)
        .pipe(map(response => response.data));
      
        const output = await lastValueFrom(res);

        return {
          apiSuccessful: true
        }

    }

    catch (error) {
      console.error(error);

      return {
        apiSuccessful: false,
        error: error.error,
      }
    }
  }

  public async permDeleteTicket(uniqueId: number, ticketGroup: string) {
    try {
      const res = this.http.delete(`${this.backendUrl}/${ticketGroup}/${uniqueId}.json`, this.standardRequestOptions)
        .pipe(map(response => response.data));
      
      const output = await lastValueFrom(res);

      return {
        apiSuccessful: true
      }

    }

    catch (error) {
      console.error(error);

      return {
        apiSuccessful: false,
        error: error.error,
      }
    }
  }
}

export interface WeTrackResponse {
  ticketGroups?: WeTrackTicketsObject,
  singleTicket?: WeTrackTicket,
  apiSuccessful: boolean,
  error?: any,
}

export interface WeTrackTicketsObject {
  [key: string]: {[key: string]: WeTrackTicket}
}