import { Controller, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PlatformInsightsService } from '../services/platform-insights.service';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

@ApiTags('platform-insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('platform-insights')
export class PlatformInsightsController {
  constructor(private readonly platformInsightsService: PlatformInsightsService) {}

  @Get('facebook')
  @ApiOperation({
    summary: 'Get Facebook Page insights',
    description: 'Fetch Facebook Page-level insights (followers, views, engagement, clicks) from Facebook Graph API.',
  })
  @ApiResponse({
    status: 200,
    description: 'Facebook Page insights retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFacebookPageInsights(@Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.platformInsightsService.getFacebookPageInsights();
  }

  @Get('instagram')
  @ApiOperation({
    summary: 'Get Instagram Account insights',
    description: 'Fetch Instagram Account-level insights (followers, impressions, reach, profile views) from Facebook Graph API.',
  })
  @ApiResponse({
    status: 200,
    description: 'Instagram Account insights retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInstagramAccountInsights(@Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.platformInsightsService.getInstagramAccountInsights();
  }
}

