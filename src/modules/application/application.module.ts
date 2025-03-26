import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ApplicatorController } from './applicator.controller';

@Module({
  imports: [],
  controllers: [ApplicationController,ApplicatorController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
