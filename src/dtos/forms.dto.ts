import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AnswerType } from 'src/common/enums/answer.enum';
import { CreateFileDto, FileResponseDto, UpdateFileDto } from './file.dto';
import { IsValidAnswerValue } from 'src/utils/answer-validate';

export class CreateFormQuestionDto {
  @ApiProperty({
    description: 'Form şablonu ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  formTemplateId: string;

  @ApiProperty({
    description: 'Soru metni',
    example: 'Adınız nedir?',
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'Cevap tipi',
    enum: AnswerType,
    example: AnswerType.TEXT,
  })
  @IsEnum(AnswerType, { message: 'Geçerli bir cevap tipi olmalıdır' })
  answerType: AnswerType;
}

export class UpdateFormQuestionDto {
  @ApiPropertyOptional({
    description: 'Soru metni',
    example: 'Güncellenmiş soru metni',
  })
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiPropertyOptional({
    description: 'Cevap tipi',
    enum: AnswerType,
    example: AnswerType.MULTIPLE_CHOICE,
  })
  @IsOptional()
  @IsEnum(AnswerType)
  answerType?: AnswerType;
}

export class CreateFormTemplateDto {
  @ApiProperty({
    description: 'Form şablonu başlığı',
    example: 'Başvuru Formu',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Form şablonu açıklaması',
    example: 'Bu form başvurunuzu tamamlamak için gerekli bilgileri toplar',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Form şablonu soruları',
    type: [CreateFormQuestionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormQuestionDto)
  questions?: CreateFormQuestionDto[];
}

export class UpdateFormTemplateDto {
  @ApiPropertyOptional({
    description: 'Form şablonu başlığı',
    example: 'Güncellenmiş Başvuru Formu',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Form şablonu açıklaması',
    example: 'Bu form güncellenerek yeni sorular eklendi',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Form şablonu soruları',
    type: [UpdateFormQuestionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFormQuestionDto)
  questions?: UpdateFormQuestionDto[];
}

export class FormQuestionResponseDto {
  @ApiProperty({
    description: 'Soru ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Form şablonu ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  formTemplateId: string;

  @ApiProperty({
    description: 'Soru metni',
    example: 'Adınız nedir?',
  })
  questionText: string;

  @ApiProperty({
    description: 'Cevap tipi',
    enum: AnswerType,
    example: AnswerType.TEXT,
  })
  answerType: AnswerType;
}

export class FormTemplateResponseDto {
  @ApiProperty({
    description: 'Form şablonu ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Form şablonu başlığı',
    example: 'Başvuru Formu',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Form şablonu açıklaması',
    example: 'Bu form başvurunuzu tamamlamak için gerekli bilgileri toplar',
  })
  description?: string;

  @ApiProperty({
    description: 'Form şablonu soruları',
    type: [FormQuestionResponseDto],
  })
  questions: FormQuestionResponseDto[];

  @ApiProperty({
    description: 'Oluşturulma tarihi',
    example: '2023-01-01T12:00:00Z',
  })
  createdAt: Date;
}

export class CreateAnswerDto {
  @ApiProperty({
    description: 'Form gönderimi ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  formSubmissionId: string;

  @ApiProperty({
    description: 'Form sorusu ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  formQuestionId: string;

  @ApiProperty({
    description: 'Cevap değeri (JSON formatında)',
    examples: {
      text: {
        value: { type: AnswerType.TEXT, value: 'Örnek metin cevap' },
      },
      number: {
        value: { type: AnswerType.NUMBER, value: 42 },
      },
      boolean: {
        value: { type: AnswerType.BOOLEAN, value: true },
      },
      multipleChoice: {
        value: {
          type: AnswerType.MULTIPLE_CHOICE,
          values: ['Seçenek 1', 'Seçenek 3'],
        },
      },
    },
  })
  @IsValidAnswerValue({
    message: 'Cevap değeri geçerli bir formatta olmalıdır',
  })
  value: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Cevap dosyaları',
    type: [CreateFileDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFileDto)
  files?: CreateFileDto[];
}

export class UpdateAnswerDto {
    @ApiProperty({
      description: 'Cevap ID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    id: string;
    
    @ApiPropertyOptional({ 
      description: 'Cevap değeri (JSON formatında)',
      example: { type: 'TEXT', value: 'Güncellenmiş cevap' }
    })
    @IsOptional()
    @IsValidAnswerValue({ message: 'Cevap değeri geçerli bir formatta olmalıdır' })
    value?: Record<string, any>;
  
    @ApiPropertyOptional({ 
      description: 'Eklenecek yeni dosyalar',
      type: [CreateFileDto]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFileDto)
    newFiles?: CreateFileDto[];
  }

export class AnswerResponseDto {
  @ApiProperty({
    description: 'Cevap ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Form gönderimi ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  formSubmissionId: string;

  @ApiProperty({
    description: 'Form sorusu ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  formQuestionId: string;

  @ApiProperty({
    description: 'Cevap değeri (JSON formatında)',
    example: { type: AnswerType.TEXT, value: 'Örnek cevap' },
  })
  value: Record<string, any>;

  @ApiProperty({
    description: 'Cevap dosyaları',
    type: [FileResponseDto],
  })
  files: FileResponseDto[];
}
