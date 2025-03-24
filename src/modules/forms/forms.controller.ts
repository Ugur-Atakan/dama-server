//src/modules/forms/forms.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { AnswerResponseDto, CreateAnswerDto, CreateFormQuestionDto, CreateFormTemplateDto, FormQuestionResponseDto, FormTemplateResponseDto, UpdateAnswerDto, UpdateFormQuestionDto, UpdateFormTemplateDto } from 'src/dtos/forms.dto';
import { CreateFormSubmissionDto, FormSubmissionResponseDto, UpdateFormSubmissionDto } from 'src/dtos/form-submission.dto';
import { CreateFileDto, FileResponseDto, UpdateFileDto } from 'src/dtos/file.dto';
import { Public } from 'src/common/decorators/public.decorator';


@ApiTags('forms')
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  /*** FORM TEMPLATE ENDPOINTS ***/
  @Public()
  @Post('templates')
  @ApiOperation({ summary: 'Yeni bir form şablonu oluştur' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Form şablonu başarıyla oluşturuldu.',
    type: FormTemplateResponseDto
  })
  async createTemplate(@Body() createFormTemplateDto: CreateFormTemplateDto) {
    return this.formsService.createTemplate(createFormTemplateDto);
  }

  @Public()
  @Get('templates')
  @ApiOperation({ summary: 'Tüm form şablonlarını getir' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form şablonları başarıyla getirildi.',
    type: [FormTemplateResponseDto]
  })
  async findAllTemplates() {
    return this.formsService.findAllTemplates();
  }
  @Public()
  @Get('templates/:id')
  @ApiOperation({ summary: 'ID\'ye göre form şablonu getir' })
  @ApiParam({ name: 'id', description: 'Form şablonu ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form şablonu başarıyla getirildi.',
    type: FormTemplateResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form şablonu bulunamadı.'
  })
  async findTemplateById(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.findTemplateById(id);
  }

  @Public()
  @Patch('templates/:id')
  @ApiOperation({ summary: 'Form şablonunu güncelle' })
  @ApiParam({ name: 'id', description: 'Form şablonu ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form şablonu başarıyla güncellendi.',
    type: FormTemplateResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form şablonu bulunamadı.'
  })
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFormTemplateDto: UpdateFormTemplateDto,
  ) {
    return this.formsService.updateTemplate(id, updateFormTemplateDto);
  }

  @Public()
  @Delete('templates/:id')
  @ApiOperation({ summary: 'Form şablonunu sil' })
  @ApiParam({ name: 'id', description: 'Form şablonu ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form şablonu başarıyla silindi.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form şablonu bulunamadı.'
  })
  async removeTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.removeTemplate(id);
  }

  /*** FORM SORU ENDPOINTS ***/

  @Public()
  @Post('questions')
  @ApiOperation({ summary: 'Yeni bir form sorusu oluştur' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Form sorusu başarıyla oluşturuldu.',
    type: FormQuestionResponseDto
  })
  async createQuestion(@Body() createFormQuestionDto: CreateFormQuestionDto) {
    return this.formsService.createQuestion(createFormQuestionDto);
  }

  @Public()
  @Get('templates/:templateId/questions')
  @ApiOperation({ summary: 'Form şablonu ID\'sine göre soruları getir' })
  @ApiParam({ name: 'templateId', description: 'Form şablonu ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form soruları başarıyla getirildi.',
    type: [FormQuestionResponseDto]
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form şablonu bulunamadı.'
  })
  async findQuestionsByTemplateId(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.formsService.findQuestionsByTemplateId(templateId);
  }

  @Public()
  @Get('questions/:id')
  @ApiOperation({ summary: 'ID\'ye göre form sorusu getir' })
  @ApiParam({ name: 'id', description: 'Form sorusu ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form sorusu başarıyla getirildi.',
    type: FormQuestionResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form sorusu bulunamadı.'
  })
  async findQuestionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.findQuestionById(id);
  }

  @Public()
  @Patch('questions/:id')
  @ApiOperation({ summary: 'Form sorusunu güncelle' })
  @ApiParam({ name: 'id', description: 'Form sorusu ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form sorusu başarıyla güncellendi.',
    type: FormQuestionResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form sorusu bulunamadı.'
  })
  async updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFormQuestionDto: UpdateFormQuestionDto,
  ) {
    return this.formsService.updateQuestion(id, updateFormQuestionDto);
  }

  @Public()
  @Delete('questions/:id')
  @ApiOperation({ summary: 'Form sorusunu sil' })
  @ApiParam({ name: 'id', description: 'Form sorusu ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form sorusu başarıyla silindi.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form sorusu bulunamadı.'
  })
  async removeQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.removeQuestion(id);
  }

  /*** FORM GÖNDERİM ENDPOINTS ***/
  @Public()
  @Post('submissions')
  @ApiOperation({ summary: 'Yeni bir form gönderimi oluştur' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Form gönderimi başarıyla oluşturuldu.',
    type: FormSubmissionResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Başvuru veya form şablonu bulunamadı.'
  })
  async createSubmission(@Body() createFormSubmissionDto: CreateFormSubmissionDto) {
    return this.formsService.createSubmission(createFormSubmissionDto);
  }

  @Public()
  @Get('applications/:applicationId/submissions')
  @ApiOperation({ summary: 'Başvuru ID\'sine göre form gönderimlerini getir' })
  @ApiParam({ name: 'applicationId', description: 'Başvuru ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form gönderimleri başarıyla getirildi.',
    type: [FormSubmissionResponseDto]
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Başvuru bulunamadı.'
  })
  async findSubmissionsByApplicationId(@Param('applicationId', ParseUUIDPipe) applicationId: string) {
    return this.formsService.findSubmissionsByApplicationId(applicationId);
  }

  @Public()
  @Get('submissions/:id')
  @ApiOperation({ summary: 'ID\'ye göre form gönderimi getir' })
  @ApiParam({ name: 'id', description: 'Form gönderimi ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form gönderimi başarıyla getirildi.',
    type: FormSubmissionResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form gönderimi bulunamadı.'
  })
  async findSubmissionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.findSubmissionById(id);
  }

@Public()
@Patch('submissions/:id')
@ApiOperation({ summary: 'Form gönderimini güncelle' })
@ApiParam({ name: 'id', description: 'Form gönderimi ID' })
@ApiResponse({ 
  status: HttpStatus.OK, 
  description: 'Form gönderimi başarıyla güncellendi.',
  type: FormSubmissionResponseDto
})
@ApiResponse({ 
  status: HttpStatus.NOT_FOUND, 
  description: 'Form gönderimi veya ilgili cevap/dosya bulunamadı.'
})
async updateSubmission(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() updateFormSubmissionDto: UpdateFormSubmissionDto,
) {
  return this.formsService.updateSubmission(id, updateFormSubmissionDto);
}

@Public()
  @Delete('submissions/:id')
  @ApiOperation({ summary: 'Form gönderimini sil' })
  @ApiParam({ name: 'id', description: 'Form gönderimi ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Form gönderimi başarıyla silindi.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form gönderimi bulunamadı.'
  })
  async removeSubmission(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.removeSubmission(id);
  }

  /*** CEVAP ENDPOINTS ***/
  @Public()
  @Post('answers')
  @ApiOperation({ summary: 'Yeni bir cevap oluştur' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Cevap başarıyla oluşturuldu.',
    type: AnswerResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form gönderimi veya soru bulunamadı.'
  })
  async createAnswer(@Body() createAnswerDto: CreateAnswerDto) {
    return this.formsService.createAnswer(createAnswerDto);
  }

  @Public()
  @Get('submissions/:submissionId/answers')
  @ApiOperation({ summary: 'Form gönderimi ID\'sine göre cevapları getir' })
  @ApiParam({ name: 'submissionId', description: 'Form gönderimi ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cevaplar başarıyla getirildi.',
    type: [AnswerResponseDto]
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form gönderimi bulunamadı.'
  })
  async findAnswersBySubmissionId(@Param('submissionId', ParseUUIDPipe) submissionId: string) {
    return this.formsService.findAnswersBySubmissionId(submissionId);
  }

  @Public()
  @Get('answers/:id')
  @ApiOperation({ summary: 'ID\'ye göre cevap getir' })
  @ApiParam({ name: 'id', description: 'Cevap ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cevap başarıyla getirildi.',
    type: AnswerResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Cevap bulunamadı.'
  })
  async findAnswerById(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.findAnswerById(id);
  }

  @Public()
  @Patch('answers/:id')
  @ApiOperation({ summary: 'Cevabı güncelle' })
  @ApiParam({ name: 'id', description: 'Cevap ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cevap başarıyla güncellendi.',
    type: AnswerResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Cevap bulunamadı.'
  })
  async updateAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    return this.formsService.updateAnswer(id, updateAnswerDto);
  }

  @Public()
  @Delete('answers/:id')
  @ApiOperation({ summary: 'Cevabı sil' })
  @ApiParam({ name: 'id', description: 'Cevap ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cevap başarıyla silindi.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Cevap bulunamadı.'
  })
  async removeAnswer(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.removeAnswer(id);
  }

  /*** DOSYA ENDPOINTS ***/

  @Public()
  @Post('files')
  @ApiOperation({ summary: 'Yeni bir dosya oluştur' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Dosya başarıyla oluşturuldu.',
    type: FileResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Form gönderimi veya cevap bulunamadı.'
  })
  async createFile(@Body() createFileDto: CreateFileDto) {
    return this.formsService.createFile(createFileDto);
  }

  @Public()
  @Get('files/:id')
  @ApiOperation({ summary: 'ID\'ye göre dosya getir' })
  @ApiParam({ name: 'id', description: 'Dosya ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dosya başarıyla getirildi.',
    type: FileResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Dosya bulunamadı.'
  })
  async findFileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.findFileById(id);
  }

  @Public()
  @Patch('files/:id')
  @ApiOperation({ summary: 'Dosyayı güncelle' })
  @ApiParam({ name: 'id', description: 'Dosya ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dosya başarıyla güncellendi.',
    type: FileResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Dosya bulunamadı.'
  })
  async updateFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.formsService.updateFile(id, updateFileDto);
  }

  @Public()
  @Patch('files/:id/mark-deleted')
  @ApiOperation({ summary: 'Dosyayı silindi olarak işaretle' })
  @ApiParam({ name: 'id', description: 'Dosya ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dosya başarıyla silindi olarak işaretlendi.',
    type: FileResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Dosya bulunamadı.'
  })
  async markFileAsDeleted(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.markFileAsDeleted(id);
  }

  @Public()
  @Delete('files/:id')
  @ApiOperation({ summary: 'Dosyayı sil' })
  @ApiParam({ name: 'id', description: 'Dosya ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dosya başarıyla silindi.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Dosya bulunamadı.'
  })
  async removeFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.formsService.removeFile(id);
  }
}