import { Global, Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentsController } from './appointment.controller';

@Global()
@Module({
  providers: [AppointmentService],
  controllers: [AppointmentsController],
  exports: [AppointmentService],
})
export class AppointmentModule {}
