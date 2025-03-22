import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

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
