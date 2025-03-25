import { AppointmentType } from '@prisma/client';
import { IsNotEmpty, IsDateString, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateAppointmentDto {
    @IsNotEmpty()
    @IsDateString()
    startTime: string;
    
    @IsNotEmpty()
    @IsString()
    @IsEnum(['ONLINE', 'OFFLINE'])
    appointmentType:AppointmentType ;
    
    @IsNotEmpty()
    @IsString()
    userId: string;
    
    @IsOptional()
    @IsString()
    notes?: string;
  }
