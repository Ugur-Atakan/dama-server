// src/form-submissions/form-submissions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FormSubmissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(formSchemaId: string) {
    // Önce form şemasının var olduğunu kontrol et
    const formExists = await this.prisma.formSchema.findFirst({
      where: { id:formSchemaId, isActive: true },
    });

    if (!formExists) {
      throw new NotFoundException(`Form with ID ${formSchemaId} not found`);
    }

    return this.prisma.formSubmission.findMany({
      where: { formSchemaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Form submission with ID ${id} not found`);
    }

    return submission;
  }

  async createFormSubmission(formSchemaId: string, applicationId: string, data: any, userId?: string) {
    const formExists = await this.prisma.formSchema.findFirst({
      where: { id:formSchemaId, isActive: true },
    });

    if (!formExists) {
      throw new NotFoundException(`Form with ID ${formSchemaId} not found`);
    }

    return this.prisma.formSubmission.create({
      data: {
        formSchema: {
          connect: { id: formSchemaId }
        },
        application: {
          connect: { id: applicationId }
        },
        data: data,
        submittedBy: userId
      }
    });
  }
}