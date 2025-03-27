import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateApplicatorDto {
  @ApiProperty({
    description: 'Telephone',
    example: '1234567890',
  })
  @IsString()
  telephone: string;

  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'Alice',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({
    description: 'The birthDate of the user',
    example: '22-12-2022',
  })
  @IsString()
  @IsOptional()
  birthDate: Date;
}


export class UpdateApplicatorData {
  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'Alice',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'The birthDate of the user',
    example: '22-12-2022',
  })
  @IsString()
  @IsOptional()
  birthDate?: Date;
}
