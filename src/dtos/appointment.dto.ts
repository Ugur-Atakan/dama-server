import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Randevu tarihi ve saati',
    example: '2025-03-27T14:30:00Z',
    type: String,
  })
  @IsNotEmpty({ message: 'Randevu tarihi ve saati gereklidir' })
  dateTime: string;

  @ApiProperty({
    description: 'Başvuranın UUID formatındaki ID değeri',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID('4', { message: 'Geçerli bir başvuran ID formatı girin' })
  @IsNotEmpty({ message: 'Başvuran ID değeri gereklidir' })
  applicatorId: string;

  @ApiPropertyOptional({
    description: 'Randevu ile ilgili notlar (opsiyonel)',
    example: 'Başvuran dosyalarını getirmeyi unutmasın',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Notlar metin formatında olmalıdır' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Randevu türü',
    enum: AppointmentType,
    default: AppointmentType.ONLINE,
    example: 'ONLINE',
  })
  @IsOptional()
  @IsEnum(AppointmentType, { message: 'Geçerli bir randevu türü seçin' })
  appointmentType?: AppointmentType;
}

export class GetAppointmentsDto {
  @ApiProperty({
    description: 'Arama yapılacak başlangıç tarihi ve saati',
    example: '2025-03-01T00:00:00Z',
    type: String,
  })
  @IsNotEmpty({ message: 'Başlangıç tarihi gereklidir' })
  startTime: string;

  @ApiProperty({
    description: 'Arama yapılacak bitiş tarihi ve saati',
    example: '2025-03-31T23:59:59Z',
    type: String,
  })
  @IsNotEmpty({ message: 'Bitiş tarihi gereklidir' })
  endTime: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'Güncellenecek randevu durumu',
    enum: AppointmentStatus,
    example: 'CONFIRMED',
  })
  @IsNotEmpty({ message: 'Randevu durumu gereklidir' })
  @IsEnum(AppointmentStatus, { message: 'Geçerli bir randevu durumu seçin' })
  status: AppointmentStatus;
}