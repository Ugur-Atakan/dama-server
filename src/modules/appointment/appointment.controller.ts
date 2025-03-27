import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Appointment } from '@prisma/client';
import { 
  CreateAppointmentDto, 
  GetAppointmentsDto, 
} from 'src/dtos/appointment.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse
} from '@nestjs/swagger';

@ApiTags('Randevular')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Public()
  @Post('create')
  @ApiOperation({ summary: 'Yeni randevu oluştur' })
  @ApiCreatedResponse({ 
    description: 'Randevu başarıyla oluşturuldu',
  })
  @ApiBadRequestResponse({ description: 'Geçersiz veri girişi' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Tüm randevuları listele' })
  @ApiOkResponse({ 
    description: 'Randevular başarıyla listelendi'
  })
  findAll(): Promise<Appointment[]> {
    return this.appointmentService.findAll();
  }

  @Public()
  @Post('get-appoinments')
  @ApiOperation({ summary: 'Belirli tarih aralığındaki randevuları getir' })
  @ApiOkResponse({ 
    description: 'Tarih aralığındaki randevular başarıyla listelendi',
  })
  @ApiBadRequestResponse({ description: 'Geçersiz tarih aralığı' })
  getAppointments(@Body() data: GetAppointmentsDto) {
    return this.appointmentService.getAppointments(
      data.startTime,
      data.endTime,
    );
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Randevu sil' })
  @ApiParam({ name: 'id', description: 'Randevu ID', type: 'string' })
  @ApiOkResponse({ description: 'Randevu başarıyla silindi' })
  @ApiNotFoundResponse({ description: 'Randevu bulunamadı' })
  remove(@Param('id', ParseIntPipe) id: string): Promise<Appointment> {
    return this.appointmentService.remove(id);
  }
  
}