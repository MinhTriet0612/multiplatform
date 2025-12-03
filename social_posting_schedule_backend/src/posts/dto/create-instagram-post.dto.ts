import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum, ArrayMaxSize, MaxLength, IsBoolean, IsUrl } from 'class-validator';

export enum InstagramMediaType {
  CAROUSEL = 'CAROUSEL',
  REELS = 'REELS',
  STORIES = 'STORIES',
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
    description: 'Media type: CAROUSEL (images only), REELS (video), or STORIES (video)',
    enum: InstagramMediaType,
    example: InstagramMediaType.CAROUSEL,
  })
  @IsOptional()
  @IsEnum(InstagramMediaType)
  mediaType?: InstagramMediaType;

  @ApiPropertyOptional({
    description: 'Group ID (campaign ID) to associate this post with',
    example: 'clx1234567890',
  })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({
    description: 'Cover image URL for Reels (required for Reels)',
    example: 'https://cdn.example.com/cover.jpg',
  })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({
    description: 'For Reels: whether to share to main feed (default: true)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  shareToFeed?: boolean;

  @ApiPropertyOptional({
    description: 'Instagram location ID for location tagging',
    example: '213385402',
  })
  @IsOptional()
  @IsString()
  locationId?: string;
}

