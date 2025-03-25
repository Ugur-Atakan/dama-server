// src/forms/dto/form-schema.dto.ts
import { IsString, IsObject, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormOptionDto {
  @ApiProperty({
    description: 'Seçenek değeri (backend için kullanılır)',
    example: 'option_1'
  })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Dile göre seçenek etiketi',
    example: { tr: 'Seçenek 1', en: 'Option 1' }
  })
  @IsObject()
  label: Record<string, string>;
}

export class ConditionDto {
  @ApiProperty({
    description: 'Bağlı olduğu alan adı',
    example: 'question_1'
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Karşılaştırma operatörü',
    enum: ['eq', 'neq', 'gt', 'lt', 'contains'],
    example: 'eq'
  })
  @IsString()
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';

  @ApiProperty({
    description: 'Karşılaştırılacak değer',
    example: 'true'
  })
  value: any;
}

export class DynamicListFieldDto {
  @ApiProperty({
    description: 'Alt alan adı',
    example: 'child_name'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Alt alan tipi',
    enum: ['text', 'textarea', 'date', 'boolean', 'select'],
    example: 'text'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Dile göre alt alan etiketi',
    example: { tr: 'Çocuk Adı', en: 'Child Name' }
  })
  @IsObject()
  label: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Dile göre placeholder metni',
    example: { tr: 'Çocuğun adını girin', en: 'Enter child name' }
  })
  @IsOptional()
  @IsObject()
  placeholder?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Eğer select tipi ise, seçenekler',
    type: [FormOptionDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormOptionDto)
  options?: FormOptionDto[];

  @ApiPropertyOptional({
    description: 'Alan zorunlu mu?',
    example: true
  })
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Validasyon kuralları',
    example: { minLength: 3, maxLength: 50 }
  })
  @IsOptional()
  validation?: any;
}

export class FormFieldDto {
  @ApiProperty({
    description: 'Alan/soru adı (sistem için)',
    example: 'question_1'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Alan/soru tipi',
    enum: ['text', 'textarea', 'date', 'boolean', 'select', 'dynamicList'],
    example: 'text'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Dile göre soru metni',
    example: { tr: 'Adınız nedir?', en: 'What is your name?' }
  })
  @IsObject()
  label: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Dile göre placeholder metni',
    example: { tr: 'Adınızı girin', en: 'Enter your name' }
  })
  @IsOptional()
  @IsObject()
  placeholder?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Dile göre soru açıklaması',
    example: { tr: 'Lütfen tam adınızı girin', en: 'Please enter your full name' }
  })
  @IsOptional()
  @IsObject()
  description?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Eğer select tipi ise, seçenekler',
    type: [FormOptionDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormOptionDto)
  options?: FormOptionDto[];

  @ApiPropertyOptional({
    description: 'Validasyon kuralları',
    example: { minLength: 3, maxLength: 50, pattern: '^[A-Za-z0-9]+$' }
  })
  @IsOptional()
  validation?: any;

  @ApiPropertyOptional({
    description: 'Alan zorunlu mu?',
    example: true
  })
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Koşullu gösterim kuralları',
    type: [ConditionDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions?: ConditionDto[];

  @ApiPropertyOptional({
    description: 'Dinamik liste için alt alanlar',
    type: [DynamicListFieldDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DynamicListFieldDto)
  fields?: DynamicListFieldDto[];
}

export class FormSectionDto {
  @ApiProperty({
    description: 'Bölüm ID',
    example: 'section_1'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Dile göre bölüm başlığı',
    example: { tr: 'Kişisel Bilgiler', en: 'Personal Information' }
  })
  @IsObject()
  title: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Dile göre bölüm açıklaması',
    example: { tr: 'Bu bölümde kişisel bilgilerinizi girmeniz gerekmektedir.', en: 'In this section, you need to enter your personal information.' }
  })
  @IsOptional()
  @IsObject()
  description?: Record<string, string>;

  @ApiProperty({
    description: 'Bölümdeki alanlar/sorular',
    type: [FormFieldDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}

export class FormSchemaDto {
  @ApiProperty({
    description: 'Form ID',
    example: 'contact-form'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Dile göre form başlığı',
    example: { tr: 'İletişim Formu', en: 'Contact Form' }
  })
  @IsObject()
  title: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Dile göre form açıklaması',
    example: { tr: 'Bizimle iletişime geçmek için bu formu doldurun.', en: 'Fill out this form to contact us.' }
  })
  @IsOptional()
  @IsObject()
  description?: Record<string, string>;

  @ApiProperty({
    description: 'Form bölümleri',
    type: [FormSectionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormSectionDto)
  sections: FormSectionDto[];
}