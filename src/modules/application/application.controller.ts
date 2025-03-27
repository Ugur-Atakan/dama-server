import {
  Controller,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
  Put,
  Body,
} from '@nestjs/common';
import { ApplicatorJwtAuthGuard } from '../auth/guards/applicator-jwt-auth.guard';
import { GetApplicator } from 'src/common/decorators/applicator.decorator';
import { ApplicationService } from './application.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ApplicatorRoute } from 'src/common/decorators/applicator-route.decorator';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @ApiOperation({
    summary: 'Get applications for the current applicator',
  })
  @UseGuards(ApplicatorJwtAuthGuard)
  @ApplicatorRoute() // This decorator checks
  @Get('my-applications')
  async getApplicationsForApplicator(
    @GetApplicator() applicator, // This decorator checks if applicatorId matches authenticated applicator
  ) {
    try {
      const applications = await this.applicationService.getUserApplications(
        applicator.id,
      );
      return applications;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(ApplicatorJwtAuthGuard)
  @ApplicatorRoute()
  @Put('update-section/pre-application')
  async updatePreApplicationSection(
    @GetApplicator() applicator,
    @Body() data: { section: string; step: number; data: any },
  ) {
    try {
      const updatedApplication =
        await this.applicationService.updatePreApplicationSection(
          applicator.application.id,
          data,
        );
      return updatedApplication;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(ApplicatorJwtAuthGuard)
  @ApplicatorRoute()
  @Public()
  @Put('update-section/application')
  async updateApplicationSection(
    @GetApplicator() applicator,
    @Body() data: { section: string; step: number; data: any },
  ) {
    try {
      const updatedApplication =
        await this.applicationService.updateApplicationSection(
          applicator.application.id,
          data,
        );
      return updatedApplication;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
