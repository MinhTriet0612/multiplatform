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
import { FacebookService } from '../services/facebook.service';
import { CreateFacebookPostDto } from '../dto/create-facebook-post.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

@ApiTags('facebook-posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('posts/facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload and publish post to Facebook',
    description: 'Publish a text, photo, or video post to Facebook. Supports scheduling.',
  })
  @ApiResponse({
    status: 201,
    description: 'Facebook post successfully created and published',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upload(@Req() req: AuthenticatedRequest, @Body() dto: CreateFacebookPostDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.facebookService.upload(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all Facebook posts',
    description: 'Retrieve all Facebook posts for the authenticated user',
  })
  async findAll(@Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.facebookService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Facebook post by ID',
    description: 'Retrieve a specific Facebook post by ID',
  })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.facebookService.findOne(id, req.user.userId);
  }
}

