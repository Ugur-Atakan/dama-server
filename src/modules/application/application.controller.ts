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
  @Put(':applicationId/pre-application/:section')
  async updatePreApplicationSection(
    @Param('applicationId') applicationId: string,
    @Param('section') section: string,
    @Body() body: { data: any },
  ) {
    try {
      const updatedApplication =
        await this.applicationService.updatePreApplicationSection(
          applicationId,
          section,
          body.data,
        );
      return updatedApplication;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Put(':applicationId/application/:section')
  async updateApplicationSection(
    @Param('applicationId') applicationId: string,
    @Param('section') section: string,
    @Body() body: { data: any },
  ) {
    try {
      const updatedApplication =
        await this.applicationService.updateApplicationSection(
          applicationId,
          section,
          body.data,
        );
      return updatedApplication;
    } catch (error: any) {
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
  @Patch('update-applicator')
  async updateApplicatorData(@Body() data: any) {
    await this.applicationService.updateApplicatorData(data);
    return { message: 'Applicator updated' };
  }
}
