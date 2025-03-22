import { Controller, Get, Post,Body, Param, Request } from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Task} from '@prisma/client';
import { TaskMessageDto } from 'src/dtos/task.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Belirli bir görevi getir' })
  @ApiResponse({ status: 200, description: 'Görev detayları başarıyla döndürüldü.' })
  async getTask(@Param('id') id: string): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Post('add-message')
  @ApiOperation({ summary: 'Taska Yeni mesaj ekle' })
  @ApiResponse({ status: 200, description: 'Mesaj başarıyla eklendi.' })
  async addMessageToTask(@Body() message: TaskMessageDto,@Request() req:any) {
    return await this.taskService.addMessageToTask(req.user.id,{...message,isStaff:false});
  }
  
}
