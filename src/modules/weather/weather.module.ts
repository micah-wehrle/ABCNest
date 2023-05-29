import { Module } from '@nestjs/common';

import { WeatherController } from './controllers/weather.controller';

@Module({
  controllers: [WeatherController]
})
export class WeatherModule {}
