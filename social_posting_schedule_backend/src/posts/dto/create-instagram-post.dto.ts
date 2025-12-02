import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum, IsDateString, ArrayMaxSize, MaxLength } from 'class-validator';

export enum InstagramMediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  REELS = 'REELS',
  STORIES = 'STORIES',
  CAROUSEL = 'CAROUSEL',
}

export class CreateInstagramPostDto {
  @ApiProperty({
    description: 'Post caption',
    example: 'Check out this amazing post!',
    maxLength: 2200,
  })
  @IsString()
  @MaxLength(2200)
  content: string;

  @ApiProperty({
    description: 'Array of media URLs. Single: [url], Carousel: [url1, url2, ...] (max 10)',
    example: ['https://cdn.example.com/image.jpg'],
    type: [String],
    maxItems: 10,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  mediaUrls: string[];

  @ApiPropertyOptional({
    description: 'Media type. Auto-detected if not provided',
    enum: InstagramMediaType,
    example: InstagramMediaType.IMAGE,
  })
  @IsOptional()
  @IsEnum(InstagramMediaType)
  mediaType?: InstagramMediaType;
}

