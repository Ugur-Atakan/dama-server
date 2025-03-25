
// src/form-submissions/form-submissions.controller.ts
import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FormSubmissionsService } from './form-submissions.service';
import { Request } from 'express';
import { CreateFormSubmissionDto, FormSubmissionResponseDto } from 'src/dtos/form-submission.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('submissions')
@Controller('forms/:formId/submissions')
export class FormSubmissionsController {
  constructor(private readonly formSubmissionsService: FormSubmissionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Belirli bir form için tüm gönderileri listele' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Form gönderimleri başarıyla alındı.'
  })
  @ApiResponse({ status: 404, description: 'Form bulunamadı.' })
  @ApiBearerAuth('access-token')
  findAll(@Param('formId') formId: string) {
    return this.formSubmissionsService.findAll(formId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Belirli bir form gönderimini getir' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'id', description: 'Gönderim ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Form gönderimi başarıyla alındı.'
  })
  @ApiResponse({ status: 404, description: 'Form gönderimi bulunamadı.' })
  @ApiBearerAuth('access-token')
  findOne(@Param('id') id: string) {
    return this.formSubmissionsService.findOne(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Yeni bir form gönderimi oluştur' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'applicationId', description: 'Uygulama ID' })
  @ApiBody({
    description: 'Form verileri',
    type:CreateFormSubmissionDto,
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Form gönderimi başarıyla oluşturuldu.',
    type:FormSubmissionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Form bulunamadı.' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri.' })
  create(
    @Param('formId') formId: string, 
    @Param('applicationId') applicationId: string,
    @Body() formData: any,
    @Req() req: Request
  ) {
    // Kullanıcı kimliği, kimlik doğrulama uygulandığında istek nesnesinden çıkarılabilir
    const userId = req.user ? (req.user as any).id : null;
    return this.formSubmissionsService.createFormSubmission(formId, formData,applicationId, userId);
  }
}