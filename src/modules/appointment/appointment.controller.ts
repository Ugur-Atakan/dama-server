import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentStatus } from '@prisma/client';
import { CreateAppointmentDto } from 'src/dtos/appointment.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Public()
  @Post('create')
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Public()

  @Get('all')
  findAll(): Promise<Appointment[]> {
    return this.appointmentService.findAll();
  }

  @Public()
  @Get('available-slots')
  findAvailableSlots(
    @Query('date') date: string,
    @Query('appointmentTypeId') appointmentTypeId: string,
  ) {
    return this.appointmentService.findAvailableSlots(date, appointmentTypeId);
  }

  @Public()

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentService.findOne(id);
  }

  @Public()
  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: string,
    @Body('status') status: AppointmentStatus,
  ): Promise<Appointment> {
    return this.appointmentService.updateStatus(id, status);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string): Promise<Appointment> {
    return this.appointmentService.remove(id);
  }
}
