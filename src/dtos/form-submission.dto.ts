import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  AnswerResponseDto,
  CreateAnswerDto,
  UpdateAnswerDto,
} from './forms.dto';
import { CreateFileDto, FileResponseDto, UpdateFileDto } from './file.dto';

export class CreateFormSubmissionDto {
  @ApiProperty({
    description: 'Başvuru ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @ApiProperty({
    description: 'Form şablonu ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  formTemplateId: string;

  @ApiProperty({
    description: 'Form cevapları',
    type: [CreateAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @ApiPropertyOptional({
    description: 'Form düzeyinde dosyalar',
    type: [CreateFileDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFileDto)
  files?: CreateFileDto[];
}

export class UpdateFormSubmissionDto {
  @ApiPropertyOptional({
    description: 'Form cevapları',
    type: [UpdateAnswerDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers?: UpdateAnswerDto[];

  @ApiPropertyOptional({
    description: 'Form düzeyinde dosyalar',
    type: [UpdateFileDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFileDto)
  files?: UpdateFileDto[];
}

export class FormSubmissionResponseDto {
  @ApiProperty({
    description: 'Form gönderimi ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Başvuru ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  applicationId: string;

  @ApiProperty({
    description: 'Form şablonu ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  formTemplateId: string;

  @ApiProperty({
    description: 'Gönderim tarihi',
    example: '2023-01-01T12:00:00Z',
  })
  submittedAt: Date;

  @ApiProperty({
    description: 'Form cevapları',
    type: [AnswerResponseDto],
  })
  answers: AnswerResponseDto[];

  @ApiProperty({
    description: 'Form düzeyinde dosyalar',
    type: [FileResponseDto],
  })
  files: FileResponseDto[];
}
