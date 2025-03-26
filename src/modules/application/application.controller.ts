import {
  Controller,
  Put,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Post,
  Patch,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Public()
  @Get('all')
  async getAllApplications() {
    try {
      const applications = await this.applicationService.getAllApplications();
      return applications;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Get(':applicationId')
  async getApplicationWithForms(@Param('applicationId') applicationId: string) {
    try {
      const application =
        await this.applicationService.getApplicationWithForms(applicationId);
      return application;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('create-application')
  async createApplicationAfterPhoneVerification(
    @Body('telephone') telephone: string,
  ) {
    const newApplication =
      await this.applicationService.createApplicationForVerifiedPhone(
        telephone,
      );
    return { message: 'Başvuru oluşturuldu', application: newApplication };
  }
  
  @Public()
  @Put(':applicationId/pre-application')
  async updatePreApplicationSection(
    @Param('applicationId') applicationId: string,
    @Body() body: { section: string; step: number; data: any },
  ) {
    try {
      const updatedApplication = await this.applicationService.updatePreApplicationSection(
        applicationId,
        body,
      );
      return updatedApplication;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Put(':applicationId/application')
  async updateApplicationSection(
    @Param('applicationId') applicationId: string,
    @Body() body: { section: string; step: number; data: any },
  ) {
    try {
      const updatedApplication = await this.applicationService.updateApplicationSection(
        applicationId,
        body,
      );
      return updatedApplication;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


}
