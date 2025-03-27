import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { HttpModule } from '@nestjs/axios';
import { AdminUserController } from './user/user.admin.controller';
import { AdminMainController } from './admin.controller';
import { ApplicationService } from '../application/application.service';
import { ApplicatorAuthService } from '../auth/applicator-auth.service';
import { JwtService } from '@nestjs/jwt';
import { OTPService } from '../auth/otp.service';

@Module({
  imports: [HttpModule],
  providers: [AdminService, UserService,ApplicationService,ApplicatorAuthService,JwtService,OTPService],

  exports: [AdminService],
  controllers: [
    AdminUserController,
    AdminMainController,
  ],
})
export class AdminModule {}
