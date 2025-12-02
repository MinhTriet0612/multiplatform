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
import { TikTokService } from '../services/tiktok.service';
import { CreateTikTokPostDto } from '../dto/create-tiktok-post.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

@ApiTags('tiktok-posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('posts/tiktok')
export class TikTokController {
  constructor(private readonly tiktokService: TikTokService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload and publish video to TikTok',
    description: 'Publish a video post to TikTok. Supports scheduling.',
  })
  @ApiResponse({
    status: 201,
    description: 'TikTok post successfully created and published',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upload(@Req() req: AuthenticatedRequest, @Body() dto: CreateTikTokPostDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.tiktokService.upload(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all TikTok posts',
    description: 'Retrieve all TikTok posts for the authenticated user',
  })
  async findAll(@Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.tiktokService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get TikTok post by ID',
    description: 'Retrieve a specific TikTok post by ID',
  })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.tiktokService.findOne(id, req.user.userId);
  }
}

