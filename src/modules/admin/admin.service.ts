import { HttpException, Injectable } from '@nestjs/common';
import { CreateApplicatorDto } from 'src/dtos/applicator.dto';
import { PrismaService } from 'src/prisma.service';
import { ApplicationService } from '../application/application.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService,
    private readonly applicationService: ApplicationService,
  ) {}

  async getSystemStats() {
    try {
      const totalUsers = await this.prismaService.user.count();
      const totalApplicators = await this.prismaService.applicator.count({where: {status: 'APPLICATOR'}});
      const totalClients = await this.prismaService.applicator.count({where: {status: 'CLIENT'}});
      const totalApplications = await this.prismaService.application.count();
      const totalAppointments = await this.prismaService.appointment.count();
      const recentApplications = await this.prismaService.application.findMany({
        select: {
          id: true,
          applicationNumber: true,
          preApplicationData: true,
          applicationData: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      
      const recentUsers = await this.prismaService.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      return {
        totalUsers,
        recentUsers,
        totalApplicators,
        totalClients,
        totalApplications,
        totalAppointments,
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
