import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFacebookPostDto, FacebookMediaType } from '../dto/create-facebook-post.dto';
import { FacebookPublisher } from '../platforms/facebook.publisher';
import { FacebookPostStatus } from '@prisma/client';

@Injectable()
export class FacebookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookPublisher: FacebookPublisher,
  ) {}

  async upload(userId: string, dto: CreateFacebookPostDto) {
    const mediaType = dto.mediaType || this.detectMediaType(dto.mediaUrl);
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;
    const published = !scheduledAt;

    const post = await this.prisma.facebookPost.create({
      data: {
        userId,
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

