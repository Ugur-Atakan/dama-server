// src/forms/form-schema.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FormSchemaService } from './form-schema.service';
import { FormSchemaDto } from 'src/dtos/form-schema.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('forms')
@Controller('form-schemas')
export class FormSchemaController {
  constructor(private readonly formSchemaService: FormSchemaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Tüm form şemalarını listele' })
  @ApiResponse({ 
    status: 200, 
    description: 'Form şemaları başarıyla alındı.',
    type: [FormSchemaDto]
  })
  findAll() {
    return this.formSchemaService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Belirli bir form şemasını getir' })
  @ApiParam({ name: 'id', description: 'Form Şema ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Form şeması başarıyla alındı.',
    type: FormSchemaDto
  })
  @ApiResponse({ status: 404, description: 'Form şeması bulunamadı.' })
  findOne(@Param('id') id: string) {
    return this.formSchemaService.findOne(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Yeni bir form şeması oluştur' })
  @ApiResponse({ 
    status: 201, 
    description: 'Form şeması başarıyla oluşturuldu.',
    type: FormSchemaDto
  })
  @ApiResponse({ status: 400, description: 'Geçersiz veri.' })
  @ApiBearerAuth('access-token')
  create(@Body() createFormSchemaDto: FormSchemaDto) {
    return this.formSchemaService.create(createFormSchemaDto);
  }

  @Public()
  @Put(':id')
  @ApiOperation({ summary: 'Mevcut bir form şemasını güncelle' })
  @ApiParam({ name: 'id', description: 'Form Şema ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Form şeması başarıyla güncellendi.',
    type: FormSchemaDto
  })
  @ApiResponse({ status: 404, description: 'Form şeması bulunamadı.' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri.' })
  @ApiBearerAuth('access-token')
  update(@Param('id') id: string, @Body() updateFormSchemaDto: FormSchemaDto) {
    return this.formSchemaService.update(id, updateFormSchemaDto);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Bir form şemasını devre dışı bırak' })
  @ApiParam({ name: 'id', description: 'Form Şema ID' })
  @ApiResponse({ status: 200, description: 'Form şeması başarıyla devre dışı bırakıldı.' })
  @ApiResponse({ status: 404, description: 'Form şeması bulunamadı.' })
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string) {
    return this.formSchemaService.remove(id);
  }
}
