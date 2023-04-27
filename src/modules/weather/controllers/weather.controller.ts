import { Controller, Get } from '@nestjs/common';

@Controller('/weather')
export class WeatherController {
  @Get('/get')
  async getWeather() {
    return {
      'flowStatus': 'SUCCESS',
      'flowStatusMessage': 'Cloudy, with a chance of fun!'
    }
  }
}
