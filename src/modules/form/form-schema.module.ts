// src/forms/form-schema.module.ts
import { Module } from '@nestjs/common';
import { FormSchemaService } from './form-schema.service';
import { FormSchemaController } from './form-schema.controller';

@Module({
  providers: [FormSchemaService],
  controllers: [FormSchemaController],
  exports: [FormSchemaService],
})
export class FormSchemaModule {}

