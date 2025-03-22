import { Module } from '@nestjs/common';
import {  TaskService } from './task.service';
import { TaskController } from './task.controller';
import { HttpModule } from '@nestjs/axios';


@Module({
    imports: [HttpModule],
    providers: [TaskService],
    controllers: [TaskController],
})
export class TaskModule {}