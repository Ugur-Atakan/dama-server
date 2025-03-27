import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Put,
  Body,
  Post,
  Req,
} from '@nestjs/common';
import { ApplicatorJwtAuthGuard } from '../auth/guards/applicator-jwt-auth.guard';
import { GetApplicator } from 'src/common/decorators/applicator.decorator';
import { SelfApplicator } from 'src/common/decorators/self-applicator.decorator';
import { ApplicationService } from './application.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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



  @ApiOperation({
    summary: 'Get applications for the current applicator',
  })
  @UseGuards(ApplicatorJwtAuthGuard)
  @Get('my-applications')
  async getApplicationsForApplicator(
    @SelfApplicator() applicator, // This decorator checks if applicatorId matches authenticated applicator
    @Req() req,
  ) {
    try {
      // At this point, we've already verified the applicator can access this data
      console.log('Authenticated applicator:', applicator);
      console.log('Authenticated useraaa:',req.applicator);
      const applications = await this.applicationService.getUserApplications(applicator.id);
      return applications;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({
    summary: 'Alternative way to get applications for the current applicator',
  })
  @UseGuards(ApplicatorJwtAuthGuard)
  @Get('applicator/:applicatorId/alt')
  async getApplicationsAlt(
    @Param('applicatorId') applicatorId: string,
    @GetApplicator() applicator,
  ) {
    try {
      // Manual security check
      if (applicator.id !== applicatorId) {
        throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
      }
      
      const applications = await this.applicationService.getUserApplications(applicatorId);
      return applications;
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
