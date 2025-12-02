import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateTikTokPostDto {
  @ApiProperty({
    description: 'Video description/caption',
    example: 'Check out this amazing video!',
    maxLength: 2200,
  })
  @IsString()
  @MaxLength(2200)
  content: string;

  @ApiProperty({
    description: 'Video URL',
    example: 'https://cdn.example.com/video.mp4',
  })
  @IsString()
  videoUrl: string;

  @ApiPropertyOptional({
    description: 'Video title',
    example: 'Amazing Video Title',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({
    description: 'Scheduled publish date (ISO 8601 format)',
    example: '2024-12-25T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

