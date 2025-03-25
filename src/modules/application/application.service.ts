import { PrismaService } from 'src/prisma.service';
import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService
  ) {}
  
  async getApplicationByUser(userId: string) {
    // Kullanıcının draft durumundaki başvurusunu bul veya yeni oluştur
    const application = await this.prisma.application.findFirst({
      where: { userId: userId},
      include: { files: true }
    });
    return application;
  }
    
  async finalizeApplication(id: string) {
    const application = await this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.ACTIVE,
        updatedAt: new Date()
      },
      include: { files: true }
    });
    
    return application;
  }

  
  async createApplication(data) {
    return await this.prisma.application.create({ data });
  }

  async findAll() {
    return await this.prisma.application.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.application.findUnique({ where: { id } });
  }

  async update(id: string, data) {
    return await this.prisma.application.update({ where: { id }, data: data });
  }

 async  delete(id: string) {
    return await this.prisma.application.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  async hardDelete(id: string) {
    return await this.prisma.application.delete({ where: { id } });
  }
}