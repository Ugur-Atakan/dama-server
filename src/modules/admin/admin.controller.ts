import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApplicationService } from '../application/application.service';
import { Public } from 'src/common/decorators/public.decorator';
@ApiBearerAuth()
@ApiTags('Admin Panel')
@Controller('admin')
export class AdminMainController {
  constructor(
    private readonly adminService: AdminService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Admin Panel İstatistikleri' })
  async getAdminStats() {
    return this.adminService.getSystemStats();
  }

  @Public()
  @Get('applicators')
  async getAllApplicators() {
    try {
      const applications = await this.applicationService.getAllApplicators();
      return applications;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

 @Public()
  @Get('clients')
  async getAllClients() {
    try {
      const clients = await this.applicationService.getAllClients();
      return clients;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Patch('applicator/:id/update')
  async updateApplicatorData(
    @Param('id') id: string,
    @Body()
    data: {
      firstName: string;
      lastName: string;
      email: string;
      birthDate: string;
    },
  ) {
    await this.applicationService.updateApplicatorData(id, data);
    return { message: 'Applicator updated' };
  }

  @Public()
  @Get('applications')
  async getAllApplications() {
    try {
      const applications = await this.applicationService.getAllApplications();
      return applications;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
