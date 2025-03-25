// src/form-submissions/form-submissions.module.ts
import { Module } from '@nestjs/common';
import { FormSubmissionsService } from './form-submissions.service';
import { FormSubmissionsController } from './form-submissions.controller';

@Module({
  providers: [FormSubmissionsService],
  controllers: [FormSubmissionsController],
  exports: [FormSubmissionsService],
})
export class FormSubmissionsModule {}