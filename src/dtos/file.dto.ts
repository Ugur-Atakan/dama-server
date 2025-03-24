import { IsString, IsOptional, IsNotEmpty, IsDate, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFileDto {
    @ApiProperty({ 
      description: 'Dosya URL',
      example: 'https://storage.example.com/files/document.pdf'
    })
    @IsString()
    @IsNotEmpty()
    url: string;
  
    @ApiPropertyOptional({ 
      description: 'Form gönderimi ID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsOptional()
    @IsString()
    formSubmissionId?: string;
  
    @ApiPropertyOptional({ 
      description: 'Cevap ID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsOptional()
    @IsString()
    answerId?: string;
  }
  
  
  export class UpdateFileDto {
    @ApiProperty({
      description: 'Dosya ID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    id: string;
    
    @ApiPropertyOptional({ 
      description: 'Dosya URL',
      example: 'https://storage.example.com/files/updated-document.pdf'
    })
    @IsOptional()
    @IsString()
    url?: string;
  
    @ApiPropertyOptional({ 
      description: 'Silinme tarihi',
      example: '2023-01-01T12:00:00Z'
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    deletedAt?: Date;
  }
  
  export class FileResponseDto {
    @ApiProperty({ 
      description: 'Dosya ID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;
  
    @ApiProperty({ 
      description: 'Dosya URL',
      example: 'https://storage.example.com/files/document.pdf'
    })
    url: string;
  
    @ApiProperty({ 
      description: 'Yüklenme tarihi',
      example: '2023-01-01T12:00:00Z'
    })
    uploadedAt: Date;
  
    @ApiPropertyOptional({ 
      description: 'Silinme tarihi',
      example: '2023-01-01T12:00:00Z'
    })
    deletedAt?: Date;
  
    @ApiPropertyOptional({ 
      description: 'Form gönderimi ID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    formSubmissionId?: string;
  
    @ApiPropertyOptional({ 
      description: 'Cevap ID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    })
    answerId?: string;
  }