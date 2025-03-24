import { IsNotEmpty, IsDateString, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
    @IsNotEmpty()
    @IsDateString()
    startTime: string;
    
    @IsNotEmpty()
    @IsString()
    appointmentTypeId: string;
    
    @IsNotEmpty()
    @IsString()
    userId: string;
    
    @IsOptional()
    @IsString()
    notes?: string;
  }


  export class appointmentTypeDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsNotEmpty()
    @IsInt()
    duration: number;
  }