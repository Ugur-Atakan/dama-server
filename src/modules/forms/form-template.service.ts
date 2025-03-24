import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormTemplateDto, UpdateFormTemplateDto } from 'src/dtos/forms.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FormTemplateService {
  constructor(private prisma: PrismaService) {}

  async create(createFormTemplateDto: CreateFormTemplateDto) {
    const { questions, ...formTemplateData } = createFormTemplateDto;
    
    return this.prisma.formTemplate.create({
      data: {
        ...formTemplateData,
        questions: questions ? {
          create: questions
        } : undefined
      },
      include: {
        questions: true
      }
    });
  }

  async findAll() {
    return this.prisma.formTemplate.findMany({
      include: {
        questions: true
      }
    });
  }

  async findOne(id: string) {
    const formTemplate = await this.prisma.formTemplate.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });

    if (!formTemplate) {
      throw new NotFoundException(`Form template with ID ${id} not found`);
    }

    return formTemplate;
  }

  async update(id: string, updateFormTemplateDto: UpdateFormTemplateDto) {
    await this.findOne(id);

    const { questions, ...formTemplateData } = updateFormTemplateDto;
    
    // Form şablonunu güncelle
    return this.prisma.formTemplate.update({
      where: { id },
      data: {
        ...formTemplateData
      },
      include: {
        questions: true
      }
    });
  }

  
  async remove(id: string) {
    // İlk olarak form şablonunun var olup olmadığını kontrol et
    await this.findOne(id);
    
    // Form şablonunu sil
    return this.prisma.formTemplate.delete({
      where: { id }
    });
  }
}