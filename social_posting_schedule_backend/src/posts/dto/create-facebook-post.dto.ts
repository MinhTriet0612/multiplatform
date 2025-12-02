import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';

export enum FacebookMediaType {
  TEXT = 'TEXT',
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
}

export class CreateFacebookPostDto {
  @ApiProperty({
    description: 'Post content/message',
    example: 'Check out this amazing post!',
    maxLength: 63206,
  })
  @IsString()
  @MaxLength(63206)
  content: string;

  @ApiPropertyOptional({
    description: 'Media URL (for photo or video posts)',
    example: 'https://cdn.example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Media type',
    enum: FacebookMediaType,
    example: FacebookMediaType.PHOTO,
  })
  @IsOptional()
  @IsEnum(FacebookMediaType)
  mediaType?: FacebookMediaType;

  @ApiPropertyOptional({
    description: 'Scheduled publish date (ISO 8601 format)',
    example: '2024-12-25T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

