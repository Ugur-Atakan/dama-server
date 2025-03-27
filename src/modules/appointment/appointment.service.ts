import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  Appointment,
  AppointmentStatus,
} from '@prisma/client';
import { CreateAppointmentDto } from 'src/dtos/appointment.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    try {
      // Başlangıç zamanını Date objesine çevirelim
      const appointmentDateTime = new Date(createAppointmentDto.dateTime);
      
      const result = await this.prisma.$transaction(async (tx) => {
        const appointment = await tx.appointment.create({
          data: {
            dateTime: appointmentDateTime,
            applicatorId: createAppointmentDto.applicatorId,
            status: AppointmentStatus.PENDING,
            ...(createAppointmentDto.notes && { notes: createAppointmentDto.notes }),
            ...(createAppointmentDto.appointmentType && { 
              appointmentType: createAppointmentDto.appointmentType 
            }),
          },
        });
        
        const updatedApplication = await tx.application.update({
          where: { applicatorId: createAppointmentDto.applicatorId },
          data: {
            status: ApplicationStatus.APPOINTMENT_SCHEDULED,
          },
        });
        
        return { appointment, application: updatedApplication };
      });
      
      return result;
    } catch (error) {
      console.error('Randevu oluşturulurken hata:', error);
      throw new Error('Randevu oluşturulamadı: ' + error.message);
    }
  }
  async findAll(): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      include: {
        applicator: {
          include: {
            application: true,
          },
        },
      },
    });
  }

  async getAppointments(
    startTime: string,
    endTime: string,
  ): Promise<Appointment[]> {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return this.prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        applicator: {
          include: {
            application: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Appointment> {
    // Randevunun varlığını kontrol edelim
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Randevuyu silelim
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
