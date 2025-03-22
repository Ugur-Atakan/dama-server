import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '@prisma/client';
import {
  CreateTaskDto,
  TaskAttachment,
  TaskMessageDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from 'src/dtos/task.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async findAll(showDeleted:boolean=false): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { deletedAt: showDeleted?{not:null}:null },
    });
  }

  async checkTaskExists(id: string): Promise<boolean> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    return !!task;
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedCompany: { select: { id: true, companyName: true } },
        attachments: true,
        messages: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
            attachments: {
              select: {
                id: true,
                name: true,
                url: true,
                type: true,
                uploadedBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Görev id ${id} bulunamadı`);
    }
    return task;
  }

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        Icon: createTaskDto.icon, // Modelde "Icon" olarak tanımlanmış
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        type: createTaskDto.type,
        companyId: createTaskDto.companyId,
        dueDate: createTaskDto.dueDate,
        attachments: createTaskDto.attachments
          ? {
              create: createTaskDto.attachments.map((att) => ({
                name: att.name,
                url: att.url,
                type: att.type,
                // "uploadedBy" alanı için, attachment'ı ekleyen kullanıcıyı ilişkilendiriyoruz.
                uploadedBy: {
                  connect: { id: userId },
                },
              })),
            }
          : undefined,
      },
    });
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Güncellemeden önce varlığı kontrol ediyoruz
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        Icon: updateTaskDto.icon,
        status: updateTaskDto.status,
        priority: updateTaskDto.priority,
        type: updateTaskDto.type,
        companyId: updateTaskDto.companyId,
        dueDate: updateTaskDto.dueDate,
      },
    });
  }

  async updateTaskStatus(id: string, data: UpdateTaskStatusDto): Promise<Task> {
    // Güncellemeden önce varlığı kontrol ediyoruz
    const exist = await this.checkTaskExists(id);
    if (!exist) {
      throw new NotFoundException(`Görev id ${id} bulunamadı`);
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: data.status,
        priority: data.priority,
      },
    });
  }

  async removeTask(id: string): Promise<Task> {
    await this.findOne(id);
    return this.prisma.task.update({ where: { id },data:{deletedAt:new Date()} });
  }

  async deleteTask(id: string) {
    return this.prisma.task.update({ where: { id },data:{deletedAt:new Date()} });
  }

  async addMessageToTask(userId: string, data: TaskMessageDto) {
    // Eğer attachments varsa, array formatına çeviriyoruz.
    const attachmentsArray = data.attachments
      ? Array.isArray(data.attachments)
        ? data.attachments
        : [data.attachments]
      : undefined;

    return await this.prisma.task.update({
      where: { id: data.taskId },
      data: {
        messages: {
          create: {
            message: data.message,
            isStaff: data.isStaff, // DTO'da tanımlandığı şekilde kullanıyoruz
            // Eğer attachments varsa, her birini gerekli formatta ekliyoruz
            attachments: attachmentsArray
              ? {
                  create: attachmentsArray.map((att) => ({
                    name: att.name,
                    url: att.url,
                    type: att.type,
                    uploadedBy: {
                      connect: { id: userId },
                    },
                  })),
                }
              : undefined,
            user: {
              connect: { id: userId },
            },
          },
        },
      },
    });
  }

  async addAttachmentToTask(userId: string, attachment: TaskAttachment) {
    return await this.prisma.task.update({
      where: { id: attachment.taskId },
      data: {
        attachments: {
          create: {
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
            uploadedBy: {
              connect: { id: userId },
            },
          },
        },
      },
    });
  }
}
