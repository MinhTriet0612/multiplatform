import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InstagramService } from '../services/instagram.service';
import { CreateInstagramPostDto } from '../dto/create-instagram-post.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

@ApiTags('instagram-posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('posts/instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload and publish post to Instagram',
    description: 'Publish an image, video, reels, stories, or carousel post to Instagram.',
  })
  @ApiResponse({
    status: 201,
    description: 'Instagram post successfully created and published',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upload(@Req() req: AuthenticatedRequest, @Body() dto: CreateInstagramPostDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.instagramService.upload(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all Instagram posts',
    description: 'Retrieve all Instagram posts for the authenticated user',
  })
  async findAll(@Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.instagramService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Instagram post by ID',
    description: 'Retrieve a specific Instagram post by ID',
  })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.instagramService.findOne(id, req.user.userId);
  }
}

