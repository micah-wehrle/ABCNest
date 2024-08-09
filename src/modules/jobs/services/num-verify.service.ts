import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { BehaviorSubject, Observable, Subscription, lastValueFrom, map } from 'rxjs';

@Injectable()
export class NumVerifyService {
  private axiosInstance: AxiosInstance;

  private readonly apiUrl: string = 'http://apilayer.net/api/validate';

  private loadingChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private loading: boolean;
  private httpSubscription: Subscription;
  private isSuccessfullyCompleted: boolean = false;
  private apiResponse: any;
  private apiUniqueId: number; // ????

  constructor(private http: HttpService) {}

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

  public getResponse(): any {
    return this.apiResponse;
  }

  public async call(phoneNumber: number) {

    if (!this.loading && phoneNumber) {
      this.updateLoading(true);
      this.httpSubscription = this.http.get(`${this.apiUrl}/${phoneNumber}`).subscribe({
        next: (res: any) => {
          this.isSuccessfullyCompleted = true;
          this.apiResponse = res;
          this.updateLoading(false);
        },
        error: (error: any) => {
          console.log(error);
          console.log(error.error);
          this.apiResponse = null
        }
      })
    }
  }
}
