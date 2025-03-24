import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Appointment, AppointmentStatus } from '@prisma/client';
import { CreateAppointmentDto } from 'src/dtos/appointment.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // Randevu tipi bilgisini alalım (süre için)
    const appointmentType = await this.prisma.appointmentType.findUnique({
      where: { id: createAppointmentDto.appointmentTypeId },
    });

    if (!appointmentType) {
      throw new NotFoundException(`Appointment type with ID ${createAppointmentDto.appointmentTypeId} not found`);
    }

    // Başlangıç zamanını Date objesine çevirelim
    const startTime = new Date(createAppointmentDto.startTime);

    // Bitiş zamanını hesaplayalım (başlangıç + süre)
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + appointmentType.duration);

    // Çakışan randevu var mı kontrol edelim
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        status: { not: AppointmentStatus.CANCELLED },
        OR: [
          {
            // Yeni randevu mevcut bir randevuyla çakışıyor mu?
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException(
        'The requested time slot is not available.',
      );
    }

    // Randevuyu oluşturalım
    return this.prisma.appointment.create({
      data: {
        startTime,
        endTime,
        userId: createAppointmentDto.userId,
        appointmentTypeId: createAppointmentDto.appointmentTypeId,
        notes: createAppointmentDto.notes,
      },
    });
  }

  async findAll(): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      include: {
        user: true,
        appointmentType: true,
      },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
        appointmentType: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findAvailableSlots(date: string, appointmentTypeId: string) {
    // Seçilen tarih için müsait zaman dilimlerini bulma
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Randevu tipi bilgisini alalım (süre için)
    const appointmentType = await this.prisma.appointmentType.findUnique({
      where: { id: appointmentTypeId },
    });

    if (!appointmentType) {
      throw new NotFoundException(
        `Appointment type with ID ${appointmentTypeId} not found`,
      );
    }

    // O gün için mevcut randevuları alalım
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        status: { not: AppointmentStatus.CANCELLED },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Çalışma saatlerini belirleyelim (örn: 09:00 - 17:00)
    const workingHoursStart = 9; // 09:00
    const workingHoursEnd = 17; // 17:00
    const slotDuration = appointmentType.duration; // Dakika cinsinden

    // Müsait zaman dilimlerini hesaplayalım
    const availableSlots = [];
    let currentTime = new Date(startOfDay);
    currentTime.setHours(workingHoursStart, 0, 0, 0);

    while (currentTime.getHours() < workingHoursEnd) {
      const slotEndTime = new Date(currentTime);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);

      // Çalışma saati dışına taşıyor mu kontrol edelim
      if (slotEndTime.getHours() > workingHoursEnd) {
        break;
      }

      // Bu zaman dilimi herhangi bir randevu ile çakışıyor mu?
      const isConflicting = existingAppointments.some((appointment) => {
        const appointmentStart = new Date(appointment.startTime);
        const appointmentEnd = new Date(appointment.endTime);
        return currentTime < appointmentEnd && slotEndTime > appointmentStart;
      });

      if (!isConflicting) {
        availableSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEndTime),
        });
      }

      // Bir sonraki zaman dilimine geçelim
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    return availableSlots;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    // Randevunun varlığını kontrol edelim
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Randevu durumunu güncelleyelim
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
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
