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

@Controller('applicators')
export class ApplicatorController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Public()
  @Get('all')
  async getAllApplications() {
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
      const applications = await this.applicationService.getClientApplicators();
      return applications;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Patch('update-applicator')
  async updateApplicatorData(@Body() data: { id: string; firstName: string; lastName: string, email: string, birthDate: string }) {
    await this.applicationService.updateApplicatorData(data);
    return { message: 'Applicator updated' };
  }
}
