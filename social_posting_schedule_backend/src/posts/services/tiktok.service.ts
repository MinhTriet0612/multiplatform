import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTikTokPostDto } from '../dto/create-tiktok-post.dto';
import { TiktokPublisher } from '../platforms/tiktok.publisher';
import { TikTokPostStatus } from '@prisma/client';

@Injectable()
export class TikTokService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiktokPublisher: TiktokPublisher,
  ) {}

  async upload(userId: string, dto: CreateTikTokPostDto) {
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : undefined;

    const post = await this.prisma.tikTokPost.create({
      data: {
        userId,
        content: dto.content,
        videoUrl: dto.videoUrl,
        title: dto.title,
        status: TikTokPostStatus.QUEUED,
        scheduledAt,
      },
    });

    try {
      const result = await this.tiktokPublisher.publish({
        content: dto.content,
        mediaUrls: [dto.videoUrl],
      });

      return this.prisma.tikTokPost.update({
        where: { id: post.id },
        data: {
          status: TikTokPostStatus.PUBLISHED,
          externalId: result.externalId,
          publishedAt: new Date(),
          responseMessage: result.detail,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to publish';
      return this.prisma.tikTokPost.update({
        where: { id: post.id },
        data: {
          status: TikTokPostStatus.FAILED,
          responseMessage: message,
        },
      });
    }
  }

  async findAll(userId: string) {
    return this.prisma.tikTokPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.tikTokPost.findFirst({
      where: { id, userId },
    });
  }
}

