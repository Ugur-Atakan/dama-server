import { Controller, Body, Post, Get, Param, Req, Put, Delete, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from 'src/modules/task/task.service';
import { Task } from '@prisma/client';
import { CreateTaskDto, TaskAttachment, TaskMessageDto, UpdateTaskDto, UpdateTaskStatusDto } from 'src/dtos/task.dto';
import { validateAndTransform } from 'src/utils/validate';
import { Roles } from 'src/common/decorators/roles.decorator';


@ApiBearerAuth()
@ApiTags('Admin - Task Management')
@Controller('admin/task')
export class AdminTaskController {
  constructor(private readonly taskService: TaskService) {}

  @Roles('ADMIN')
  @Get('all')
  @ApiOperation({ summary: 'Tüm görevleri getir' })
  @ApiResponse({ status: 200, description: 'Görev listesi başarıyla döndürüldü.' })
  async getAllTasks(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Belirli bir görevi getir' })
  @ApiResponse({ status: 200, description: 'Görev detayları başarıyla döndürüldü.' })
  async getTask(@Param('id') id: string): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Roles('ADMIN')
  @Post('create')
  @ApiOperation({ summary: 'Yeni görev oluştur' })
  @ApiResponse({ status: 201, description: 'Görev başarıyla oluşturuldu.' })
  async createTask(@Req() req,@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    const userID=req.user.id;
    return this.taskService.create(userID,createTaskDto);
  }

  @Roles('ADMIN')
  @Put(':id/update')
  @ApiOperation({ summary: 'Görevi güncelle' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla güncellendi.' })

  async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
   const updateData= await validateAndTransform(UpdateTaskDto, updateTaskDto);
    return this.taskService.updateTask(id, updateData);
  }


  @Roles('ADMIN')
  @Post(':id/edit')
  @ApiOperation({ summary: 'Görevi güncelle' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla güncellendi.' })

  async updateTaskStatus(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskStatusDto): Promise<Task> {
   const updateData= await validateAndTransform(UpdateTaskStatusDto, updateTaskDto);
    return this.taskService.updateTask(id, updateData);
  }


  @Roles('ADMIN')
  @Delete(':id/delete')
  @ApiOperation({ summary: 'Görevi sil' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla silindi.' })
  async deleteTask(@Param('id') id: string): Promise<Task> {
    return this.taskService.removeTask(id);
  }

  @Roles('ADMIN')
  @Post('add-message')
  @ApiOperation({ summary: 'Taska Yeni mesaj ekle' })
  @ApiResponse({ status: 200, description: 'Mesaj başarıyla eklendi.' })
  async addMessageToTask(@Body() message: TaskMessageDto,@Request() req:any) {
    return await this.taskService.addMessageToTask(req.user.id,{...message,isStaff:true});
  }

  @Roles('ADMIN')
  @Post('add-attachment')
  @ApiOperation({ summary: 'Taska Yeni dosya ekle' })
  @ApiResponse({ status: 200, description: 'Dosya başarıyla eklendi.' })
  async addAttachmentToTask(@Body() attachment: TaskAttachment,@Request() req:any) {
    return await this.taskService.addAttachmentToTask(req.user.id,attachment);
  }

}