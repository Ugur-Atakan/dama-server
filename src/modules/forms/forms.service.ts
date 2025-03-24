// src/forms/forms.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateAnswerDto,
  CreateFormQuestionDto,
  CreateFormTemplateDto,
  UpdateAnswerDto,
  UpdateFormQuestionDto,
  UpdateFormTemplateDto,
} from 'src/dtos/forms.dto';
import {
  CreateFormSubmissionDto,
  UpdateFormSubmissionDto,
} from 'src/dtos/form-submission.dto';
import {
  CreateFileDto,
  UpdateFileDto,
} from 'src/dtos/file.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  /*** FORM TEMPLATE İŞLEMLERİ ***/

  async createTemplate(createFormTemplateDto: CreateFormTemplateDto) {
    const { questions, ...formTemplateData } = createFormTemplateDto;

    return this.prisma.formTemplate.create({
      data: {
        ...formTemplateData,
        questions: questions
          ? {
              create: questions,
            }
          : undefined,
      },
      include: {
        questions: true,
      },
    });
  }

  async findAllTemplates() {
    return this.prisma.formTemplate.findMany({
      include: {
        questions: true,
      },
    });
  }

  async findTemplateById(id: string) {
    const formTemplate = await this.prisma.formTemplate.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!formTemplate) {
      throw new NotFoundException(`Form template with ID ${id} not found`);
    }

    return formTemplate;
  }

  async updateTemplate(
    id: string,
    updateFormTemplateDto: UpdateFormTemplateDto,
  ) {
    await this.findTemplateById(id);

    const { questions, ...formTemplateData } = updateFormTemplateDto;

    return this.prisma.formTemplate.update({
      where: { id },
      data: {
        ...formTemplateData,
      },
      include: {
        questions: true,
      },
    });
  }

  async removeTemplate(id: string) {
    await this.findTemplateById(id);

    return this.prisma.formTemplate.delete({
      where: { id },
    });
  }

  /*** FORM SORU İŞLEMLERİ ***/

  async createQuestion(createFormQuestionDto: CreateFormQuestionDto) {
    const formTemplate = await this.prisma.formTemplate.findUnique({
      where: { id: createFormQuestionDto.formTemplateId },
    });

    if (!formTemplate) {
      throw new NotFoundException(
        `Form template with ID ${createFormQuestionDto.formTemplateId} not found`,
      );
    }

    return this.prisma.formQuestion.create({
      data: createFormQuestionDto,
    });
  }

  async findQuestionsByTemplateId(formTemplateId: string) {
    await this.findTemplateById(formTemplateId);

    return this.prisma.formQuestion.findMany({
      where: { formTemplateId },
    });
  }

  async findQuestionById(id: string) {
    const formQuestion = await this.prisma.formQuestion.findUnique({
      where: { id },
    });

    if (!formQuestion) {
      throw new NotFoundException(`Form question with ID ${id} not found`);
    }

    return formQuestion;
  }

  async updateQuestion(
    id: string,
    updateFormQuestionDto: UpdateFormQuestionDto,
  ) {
    await this.findQuestionById(id);

    return this.prisma.formQuestion.update({
      where: { id },
      data: updateFormQuestionDto,
    });
  }

  async removeQuestion(id: string) {
    await this.findQuestionById(id);

    return this.prisma.formQuestion.delete({
      where: { id },
    });
  }

  /*** FORM GÖNDERİM İŞLEMLERİ ***/

  async createSubmission(createFormSubmissionDto: CreateFormSubmissionDto) {
    const { applicationId, formTemplateId, answers, files } =
      createFormSubmissionDto;

    // Başvuru ve form şablonu kontrolü
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    const formTemplate = await this.prisma.formTemplate.findUnique({
      where: { id: formTemplateId },
    });

    if (!formTemplate) {
      throw new NotFoundException(
        `Form template with ID ${formTemplateId} not found`,
      );
    }

    // Form gönderimi oluştur
    return this.prisma.formSubmission.create({
      data: {
        applicationId,
        formTemplateId,
        answers: answers
          ? {
              create: answers.map((answer) => {
                const { files: answerFiles, ...answerData } = answer;
                return {
                  ...answerData,
                  files: answerFiles
                    ? {
                        create: answerFiles,
                      }
                    : undefined,
                };
              }),
            }
          : undefined,
        files: files
          ? {
              create: files,
            }
          : undefined,
      },
      include: {
        answers: {
          include: {
            files: true,
          },
        },
        files: true,
      },
    });
  }

  async findSubmissionsByApplicationId(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    return this.prisma.formSubmission.findMany({
      where: { applicationId },
      include: {
        answers: {
          include: {
            files: true,
          },
        },
        files: true,
      },
    });
  }

  async findSubmissionById(id: string) {
    const formSubmission = await this.prisma.formSubmission.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            files: true,
          },
        },
        files: true,
      },
    });

    if (!formSubmission) {
      throw new NotFoundException(`Form submission with ID ${id} not found`);
    }

    return formSubmission;
  }

async updateSubmission(id: string, updateFormSubmissionDto: UpdateFormSubmissionDto) {
  // Form gönderiminin var olup olmadığını kontrol et
  const formSubmission = await this.findSubmissionById(id);
  
  const { answers, files } = updateFormSubmissionDto;
  
  // Cevapları güncelle
  if (answers && answers.length > 0) {
    for (const answer of answers) {
      // Cevabın var olup olmadığını kontrol et
      const existingAnswer = formSubmission.answers.find(a => a.id === answer.id);
      if (!existingAnswer) {
        throw new NotFoundException(`Answer with ID ${answer.id} not found in form submission ${id}`);
      }
      
      // Prisma için doğru veri yapısını oluştur
      const { newFiles, ...answerData } = answer;
      
      // Cevabı güncelle
      await this.prisma.answer.update({
        where: { id: answer.id },
        data: {
          value: answerData.value,
          // Yeni dosyalar varsa ekle, ama mevcut dosyaları güncelleme burada yapma
          files: newFiles && newFiles.length > 0 ? {
            create: newFiles.map(file => ({
              url: file.url,
              formSubmissionId: file.formSubmissionId,
            }))
          } : undefined
        }
      });
    }
  }
  
  // Dosyaları güncelle
  if (files && files.length > 0) {
    for (const file of files) {
      // Dosyanın var olup olmadığını kontrol et
      const existingFile = formSubmission.files.find(f => f.id === file.id);
      if (!existingFile) {
        throw new NotFoundException(`File with ID ${file.id} not found in form submission ${id}`);
      }
      
      // Dosyayı güncelle
      await this.prisma.file.update({
        where: { id: file.id },
        data: {
          url: file.url,
          deletedAt: file.deletedAt
        }
      });
    }
  }
  
  // Güncellenmiş form gönderimleri getir
  return this.findSubmissionById(id);
}

// src/forms/forms.service.ts'deki updateAnswer metodunu düzeltme
async updateAnswer(id: string, updateAnswerDto: UpdateAnswerDto) {
  await this.findAnswerById(id);

  const { newFiles, ...answerData } = updateAnswerDto;

  // Cevabı güncelle
  return this.prisma.answer.update({
    where: { id },
    data: {
      value: answerData.value,
      // Yeni dosyalar varsa ekle
      files: newFiles && newFiles.length > 0 ? {
        create: newFiles.map(file => ({
          url: file.url,
          formSubmissionId: file.formSubmissionId
        }))
      } : undefined
    },
    include: {
      files: true
    }
  });
}


  async removeSubmission(id: string) {
    await this.findSubmissionById(id);

    return this.prisma.formSubmission.delete({
      where: { id },
    });
  }

  /*** CEVAP İŞLEMLERİ ***/

  async createAnswer(createAnswerDto: CreateAnswerDto) {
    const { formSubmissionId, formQuestionId, files, ...answerData } =
      createAnswerDto;

    // Gerekli kontroller
    const formSubmission = await this.prisma.formSubmission.findUnique({
      where: { id: formSubmissionId },
    });

    if (!formSubmission) {
      throw new NotFoundException(
        `Form submission with ID ${formSubmissionId} not found`,
      );
    }

    const formQuestion = await this.prisma.formQuestion.findUnique({
      where: { id: formQuestionId },
    });

    if (!formQuestion) {
      throw new NotFoundException(
        `Form question with ID ${formQuestionId} not found`,
      );
    }

    return this.prisma.answer.create({
      data: {
        formSubmissionId,
        formQuestionId,
        ...answerData,
        files: files
          ? {
              create: files,
            }
          : undefined,
      },
      include: {
        files: true,
      },
    });
  }

  async findAnswersBySubmissionId(formSubmissionId: string) {
    await this.findSubmissionById(formSubmissionId);

    return this.prisma.answer.findMany({
      where: { formSubmissionId },
      include: {
        files: true,
      },
    });
  }

  async findAnswerById(id: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id },
      include: {
        files: true,
      },
    });

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }

    return answer;
  }

  
  async removeAnswer(id: string) {
    await this.findAnswerById(id);

    return this.prisma.answer.delete({
      where: { id },
    });
  }

  /*** DOSYA İŞLEMLERİ ***/

  async createFile(createFileDto: CreateFileDto) {
    const { formSubmissionId, answerId } = createFileDto;

    // İlişki kontrolü
    if (formSubmissionId) {
      await this.findSubmissionById(formSubmissionId);
    }

    if (answerId) {
      await this.findAnswerById(answerId);
    }

    return this.prisma.file.create({
      data: createFileDto,
    });
  }

  async findFileById(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async updateFile(id: string, updateFileDto: UpdateFileDto) {
    await this.findFileById(id);

    return this.prisma.file.update({
      where: { id },
      data: updateFileDto,
    });
  }

  async markFileAsDeleted(id: string) {
    await this.findFileById(id);

    return this.prisma.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async removeFile(id: string) {
    await this.findFileById(id);

    return this.prisma.file.delete({
      where: { id },
    });
  }
}
