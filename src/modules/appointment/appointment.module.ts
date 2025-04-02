import { Global, Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

@Global()
@Module({
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
