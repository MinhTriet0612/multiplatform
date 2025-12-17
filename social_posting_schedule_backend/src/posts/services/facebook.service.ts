import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFacebookPostDto, FacebookMediaType } from '../dto/create-facebook-post.dto';
import { FacebookPublisher } from '../platforms/facebook.publisher';
import { FacebookPostStatus } from '@prisma/client';
import { SocialPlatformConfig } from '../config/social-platform.config';

@Injectable()
export class FacebookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookPublisher: FacebookPublisher,
    private readonly config: SocialPlatformConfig,
  ) { }

  async upload(userId: string, dto: CreateFacebookPostDto) {
    const mediaType = dto.mediaType || this.detectMediaType(dto.mediaUrl);
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
    const published = !scheduledAt;

    const post = await this.prisma.facebookPost.create({
      data: {
        userId,
        groupId: dto.groupId,
        content: dto.content,
        mediaUrl: dto.mediaUrl,
        mediaType,
        status: FacebookPostStatus.QUEUED,
        scheduledAt,
      },
    });

    try {
      const result = await this.facebookPublisher.publish({
        content: dto.content,
        mediaUrls: dto.mediaUrl ? [dto.mediaUrl] : undefined,
        mediaType: this.mapMediaType(mediaType),
        published,
        scheduledAt,
      });

      const status = published
        ? FacebookPostStatus.PUBLISHED
        : FacebookPostStatus.SCHEDULED;

      return this.prisma.facebookPost.update({
        where: { id: post.id },
        data: {
          status,
          externalId: result.externalId,
          publishedAt: published ? new Date() : undefined,
          responseMessage: result.detail,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to publish';
      return this.prisma.facebookPost.update({
        where: { id: post.id },
        data: {
          status: FacebookPostStatus.FAILED,
          responseMessage: message,
        },
      });
    }
  }

  async repost(id: string, userId: string, dto: CreateFacebookPostDto) {
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
    const published = !scheduledAt;

    const existing = await this.prisma.facebookPost.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const mediaType = dto.mediaType || this.detectMediaType(dto.mediaUrl ?? existing.mediaUrl ?? undefined);

    try {
      const result = await this.facebookPublisher.publish({
        content: dto.content,
        mediaUrls: dto.mediaUrl ? [dto.mediaUrl] : existing.mediaUrl ? [existing.mediaUrl] : undefined,
        mediaType: this.mapMediaType(mediaType),
        published,
        scheduledAt,
      });

      const status = published
        ? FacebookPostStatus.PUBLISHED
        : FacebookPostStatus.SCHEDULED;

      return this.prisma.facebookPost.update({
        where: { id: existing.id },
        data: {
          content: dto.content,
          mediaUrl: dto.mediaUrl ?? existing.mediaUrl,
          mediaType,
          groupId: dto.groupId ?? existing.groupId,
          status,
          externalId: result.externalId,
          scheduledAt,
          publishedAt: published ? new Date() : undefined,
          responseMessage: result.detail,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to publish';
      return this.prisma.facebookPost.update({
        where: { id: existing.id },
        data: {
          content: dto.content,
          mediaUrl: dto.mediaUrl ?? existing.mediaUrl,
          mediaType,
          groupId: dto.groupId ?? existing.groupId,
          status: FacebookPostStatus.FAILED,
          scheduledAt,
          responseMessage: message,
        },
      });
    }
  }

  async findAll(userId: string) {
    return this.prisma.facebookPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.facebookPost.findFirst({
      where: { id, userId },
    });
  }

  async getInsights(id: string, userId: string) {
    const post = await this.prisma.facebookPost.findFirst({
      where: { id, userId },
    });

    if (!post || !post.externalId) {
      return null;
    }

    const url = `${this.config.facebookGraphUrl}/${post.externalId}/insights`;
    // Note:
    // - Meta deprecated a number of Page/Post metrics (including post_engaged_users).
    // - We now stick to metrics that are still valid and available on Page posts:
    //   * post_reactions_by_type_total  -> tổng reaction theo từng loại (giống likes/emoji breakdown)
    //   * post_clicks_by_type          -> tổng clicks theo loại (giống engagement breakdown)
    // Reference: https://developers.facebook.com/docs/graph-api/reference/v24.0/insights
    const params = new URLSearchParams({
      metric: 'post_reactions_by_type_total,post_clicks_by_type',
      access_token: this.config.facebookAccessToken,
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Facebook Insights API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    return response.json();
  }

  private detectMediaType(mediaUrl?: string): FacebookMediaType {
    if (!mediaUrl) return FacebookMediaType.TEXT;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'];
    const lowerUrl = mediaUrl.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.includes(ext))
      ? FacebookMediaType.VIDEO
      : FacebookMediaType.PHOTO;
  }

  private mapMediaType(type: FacebookMediaType): string {
    const map: Record<FacebookMediaType, string> = {
      [FacebookMediaType.TEXT]: 'TEXT',
      [FacebookMediaType.PHOTO]: 'IMAGE',
      [FacebookMediaType.VIDEO]: 'VIDEO',
    };
    return map[type];
  }
}

