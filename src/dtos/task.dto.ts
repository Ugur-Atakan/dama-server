import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority, TaskType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TaskAttachment{
    @ApiProperty({ example: 'Dosya adı' })
    name: string;
    @ApiProperty({ example: 'https://example.com/file.pdf' })
    url: string;
    @ApiProperty({ example: 'pdf' })
    type: string;

    @ApiPropertyOptional({ example: 'task-uuid' })
    @IsOptional()
    taskId?: string;
    }

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Güncellenmiş Görev Başlığı' })
  title?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş görev açıklaması' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-icon.png' })
  icon?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.COMPLETED })
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: 'HIGH' })
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskType, example: 'LEGAL' })
  type?: TaskType;

  @ApiPropertyOptional({ example: 'company-uuid' })
  companyId?: string;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00.000Z' })
  dueDate?: Date;

  @ApiPropertyOptional({ type: [TaskAttachment] })
    attachments?: TaskAttachment[];
}


export class CreateTaskDto {

  @ApiProperty({ example: 'Yeni Görev Başlığı' })
  title?: string;

  @ApiProperty({ example: 'Görev açıklaması' })
  description?: string;

  @ApiProperty({ example: 'https://example.com/icon.png' })
  icon?: string;

  @ApiProperty({ enum: TaskStatus, example: 'OPEN' })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: 'MEDIUM' })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskType, example: 'GENERAL' })
  type: TaskType;

  @ApiProperty({ example: 'company-uuid' })
  companyId: string;

  @ApiProperty({ example: '2025-12-31T00:00:00.000Z', required: false })
  dueDate?: Date;

  @ApiPropertyOptional({ type: [TaskAttachment] })
  @IsArray()
  attachments?: TaskAttachment[];
}


export class TaskMessageDto{
    @ApiProperty({ example: 'Görev mesajı' })
    message: string;
    
    @ApiPropertyOptional({ type: [TaskAttachment] })
     @Type(() => TaskAttachment)
      @IsOptional()
      @IsArray()
    @IsArray()
    attachments?: TaskAttachment[];

    @ApiProperty({ example: 'task-uuid' })
    taskId: string;

   @ApiPropertyOptional({ example: 'false',description: 'Mesajı yazanın Personel olup olmadığı' })
   @IsOptional()
   isStaff?: boolean;
}


export class UpdateTaskStatusDto {
  
@ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.COMPLETED })
@IsEnum(TaskStatus)
status?: TaskStatus;

@ApiPropertyOptional({ enum: TaskPriority, example: 'HIGH' })
@IsEnum(TaskPriority)
priority?: TaskPriority;

}