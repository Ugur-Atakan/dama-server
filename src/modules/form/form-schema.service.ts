// src/forms/form-schema.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { FormSchemaDto } from 'src/dtos/form-schema.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FormSchemaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.formSchema.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const formSchema = await this.prisma.formSchema.findFirst({
      where: { formId: id, isActive: true },
    });

    if (!formSchema) {
      throw new NotFoundException(`Form schema with ID ${id} not found`);
    }

    return formSchema;
  }

  async create(createFormSchemaDto: FormSchemaDto) {
    return this.prisma.formSchema.create({
      data: {
        formId: createFormSchemaDto.id,
        title: JSON.stringify(createFormSchemaDto.title),
        description: createFormSchemaDto.description 
          ? JSON.stringify(createFormSchemaDto.description) 
          : null,
        schema: createFormSchemaDto as any, // JSON tipine dönüştürme
      },
    });
  }

  async update(id: string, updateFormSchemaDto: FormSchemaDto) {
    // Önce şemanın var olduğunu kontrol et
    await this.findOne(id);

    return this.prisma.formSchema.update({
      where: { formId: id },
      data: {
        title: JSON.stringify(updateFormSchemaDto.title),
        description: updateFormSchemaDto.description 
          ? JSON.stringify(updateFormSchemaDto.description) 
          : null,
        schema: updateFormSchemaDto as any, // JSON tipine dönüştürme
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    // Önce şemanın var olduğunu kontrol et
    await this.findOne(id);

    // Soft delete (isActive = false)
    return this.prisma.formSchema.update({
      where: { formId: id },
      data: { isActive: false },
    });
  }
}