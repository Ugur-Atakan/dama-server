import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HttpModule } from '@nestjs/axios';
import { AdminUserController } from './user/user.admin.controller';
import { AdminMainController } from './admin.controller';
import { ApplicationService } from '../application/application.service';

@Module({
  imports: [HttpModule],
  providers: [AdminService, UserService,ApplicationService],

  exports: [AdminService],
  controllers: [
    AdminUserController,
    AdminMainController,
  ],
})
export class AdminModule {}
