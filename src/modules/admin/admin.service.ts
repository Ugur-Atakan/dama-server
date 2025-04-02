import { HttpException, Injectable } from '@nestjs/common';
import { CreateApplicatorDto } from 'src/dtos/applicator.dto';
import { PrismaService } from 'src/prisma.service';
import { ApplicationService } from '../application/application.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService,
    private readonly applicationService: ApplicationService,
  ) {}

  async getSystemStats() {
    try {
      const totalApplicators = await this.prismaService.applicator.count({where: {status: { in: ['APPLICATOR', 'APPOINTMENT_SCHEDULED'] },deletedAt: null}});
      const totalClients = await this.prismaService.applicator.count({where: {status: 'CLIENT',deletedAt: null}});
      const totalAppointments = await this.prismaService.appointment.count();
      const comingAppointments = await this.prismaService.appointment.findMany({
        where: {
          status: AppointmentStatus.PENDING,
          dateTime: {
            gte: new Date(),
          },
        },
        include: {
          applicator: {
            select: {
              firstName: true,
              lastName: true,
              telephone: true,
            },
          },
        },
        take: 5,
      });
      const recentApplications = await this.prismaService.application.findMany({
        select: {
          id: true,
          applicationNumber: true,
          createdAt: true,
          updatedAt: true,
          applicator: {
            select: {
              firstName: true,
              lastName: true,
              telephone: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      


      return {
        totalApplicators,
        totalClients,
        totalAppointments,
        recentApplications,
        comingAppointments: comingAppointments.map((appointment) => ({
          dateTime: appointment.dateTime,
          clientName: `${appointment.applicator.firstName} ${appointment.applicator.lastName}`,
          status: appointment.status,
          notes: appointment.notes,
          appointmentType: appointment.appointmentType,
        })),
      };
    } catch (error: any) {
      throw new HttpException(error, 500);
    }
  }

  async createApplicator(dto:CreateApplicatorDto) {
    let applicator;
    const newApplicator = await this.prismaService.applicator.create({
      data: {
        ...dto,
      },
    });

    this.applicationService.createApplication(newApplicator.id);
    // After creation, fetch with related data
    applicator = await this.prismaService.applicator.findUnique({
      where: { id: newApplicator.id },
      include: {
        application: true,
        appointments: true,
      },
    });
    return applicator;
  }
}
