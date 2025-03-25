// src/form-submissions/dto/form-submission.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormSubmissionResponseDto {
  @ApiProperty({
    description: 'Gönderim ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  id: string;

  @ApiProperty({
    description: 'Form ID',
    example: 'contact-form'
  })
  formId: string;

  @ApiProperty({
    description: 'Gönderilen form verileri',
    example: {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Merhaba, bir sorum var...'
    }
  })
  data: any;

  @ApiPropertyOptional({
    description: 'Gönderimi yapan kullanıcı ID',
    example: '123'
  })
  submittedBy?: string;

  @ApiProperty({
    description: 'Oluşturulma tarihi',
    example: '2023-08-25T12:34:56Z'
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'İlişkili form şeması bilgileri',
    example: {
      formId: 'contact-form',
      title: { tr: 'İletişim Formu', en: 'Contact Form' }
    }
  })
  formSchema?: object;
}

export class CreateFormSubmissionDto {
  @ApiProperty({
    description: 'Form verileri - sorulara verilen yanıtlar',
    example: {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Merhaba, bir sorum var...'
    },
    additionalProperties: true
  })
  data: Record<string, any>;
}