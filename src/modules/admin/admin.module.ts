import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HttpModule } from '@nestjs/axios';
import { AdminUserController } from './user/user.admin.controller';
import { AdminSupportController } from './support/support.admin.controller';
import { AdminMainController } from './admin.controller';
import { SupportService } from '../support/support.service';
import { TaskService } from '../task/task.service';
import { AdminTaskController } from './task/task.admin.controller';

@Module({
  imports: [HttpModule],
  providers: [AdminService, UserService, SupportService, TaskService],

  exports: [AdminService],
  controllers: [
    AdminUserController,
    AdminSupportController,
    AdminMainController,
    AdminTaskController,
  ],
})
export class AdminModule {}
