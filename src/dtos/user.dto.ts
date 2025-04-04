// Path: src/dtos/user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDate,
  MinLength,
  IsStrongPassword,
  IsEmail,
} from 'class-validator';


export class GetUserDetailDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  userId: string;
}

export class CheckEmailisExistDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  email: string;
}


export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User first name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User telephone number', example: '5374352423' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'URL to the user\'s profile image', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  profileImage?: string;


  @ApiPropertyOptional({ description: 'Indicates if the user wants to receive notifications', example: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @ApiPropertyOptional({ description: 'Indicates if the user account is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActivate?: boolean;



}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password of the user', example: 'password123' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ description: 'New password of the user', example: 'newpassword123' })
  @IsString()
  @IsStrongPassword()
  @MinLength(6)
  newPassword: string;
}


export class ChangeEmailDto {
  @ApiProperty({ description: 'Current password of the user', example: 'password123' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ description: 'New email of the user', example: 'user@example.com' })
  @IsString()
  @IsEmail()
  newEmail: string;
}




export class SafeUserDto {
  @ApiProperty({ description: 'User ID (UUID format)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'User telephone number', example: '5374352423' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'URL to the user\'s profile image', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: 'Indicates if the user wants to receive notifications', example: true })
  @IsBoolean()
  notifications: boolean;

  @ApiProperty({ description: 'Indicates if the user\'s email is confirmed', example: false })
  @IsBoolean()
  emailConfirmed: boolean;

  @ApiProperty({ description: 'Indicates if the user\'s telephone is confirmed', example: false })
  @IsBoolean()
  telephoneConfirmed: boolean;

  @ApiProperty({ description: 'Indicates if the user account is active', example: true })
  @IsBoolean()
  isActivate: boolean;

  @ApiProperty({ description: 'Date when the user account was created', example: '2023-01-01T00:00:00Z' })
  @IsDate()
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Date when the user account was deleted', example: '2023-12-31T00:00:00Z' })
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Roles assigned to the user',
    isArray: true,
    example: [
      { id: '123e4567-e89b-12d3-a456-426614174001', role: 'USER' },
      { id: '123e4567-e89b-12d3-a456-426614174002', role: 'ADMIN' },
    ],
  })
  @IsArray()
  roles: { id: string; role: 'USER' | 'ANALYST' | 'ADMIN' }[];
}
