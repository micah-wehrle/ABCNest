import { Controller, Get, Param } from '@nestjs/common';
import { NumVerifyService } from '../services/num-verify.service';
import { take } from 'rxjs';

@Controller('num-verify')
export class NumVerifyController {

  constructor(private numVerify: NumVerifyService) {}
  // localhost:3000/num-verify/123
  @Get(':phone')
  async checkPhone(@Param('phone') phone: string) {
    const phoneAsNum: number = Number(phone);

    if (phone.length !== 10 || isNaN(phoneAsNum)) {
      return {
        'flowStatus': 'SUCCESS',
        'valid': false,
        'checkedNumber': phone
      }
    }

    this.numVerify.call(phoneAsNum);
    
    this.numVerify.getLoading().pipe(take(2)).subscribe({
      next: (loading) => {
        if (!loading && this.numVerify.hasSuccessfullyCompleted()) {
          console.log(this.numVerify.getResponse());
        }
      }
    })

    // call numverify api

    // wait for response

    // respond to front end



    
  }
}
