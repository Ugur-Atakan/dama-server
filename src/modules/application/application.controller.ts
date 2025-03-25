import { Controller, Put, Param, Body, HttpException, HttpStatus, Get, Post, Patch } from '@nestjs/common';
import { ApplicationService } from './application.service';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  async getAllApplications() {
    try {
      const applications = await this.applicationService.getAllApplications();
      return applications;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':applicationId')
  async getApplicationWithForms(@Param('applicationId') applicationId: string) {
    try {
      const application = await this.applicationService.getApplicationWithForms(applicationId);
      return application;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':applicationId/pre-application/:section')
  async updatePreApplicationSection(
    @Param('applicationId') applicationId: string,
    @Param('section') section: string,
    @Body() body: { data: any },
  ) {
    try {
      const updatedApplication = await this.applicationService.updatePreApplicationSection(
        applicationId,
        section,
        body.data,
      );
      return updatedApplication;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('create-application')
  async createApplicationAfterPhoneVerification(
    @Body('telephone') telephone: string,
  ) {
    const newApplication = await this.applicationService.createApplicationForVerifiedPhone(telephone);
    return { message: 'Başvuru oluşturuldu', application: newApplication };
  }
  @Patch('update-applicator')
  async updateApplicatorData(@Body() data: any) {
    await this.applicationService.updateApplicatorData(data);
    return { message: 'Applicator updated' };
  }
}
