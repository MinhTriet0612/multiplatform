import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInstagramPostDto, InstagramMediaType } from '../dto/create-instagram-post.dto';
import { InstagramPublisher } from '../platforms/instagram.publisher';
import { InstagramPostStatus } from '@prisma/client';

@Injectable()
export class InstagramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly instagramPublisher: InstagramPublisher,
  ) {}

  async upload(userId: string, dto: CreateInstagramPostDto) {
    const isCarousel = dto.mediaUrls.length > 1;
    const mediaType = dto.mediaType || (isCarousel ? InstagramMediaType.CAROUSEL : InstagramMediaType.IMAGE);

    const post = await this.prisma.instagramPost.create({
      data: {
        userId,
        content: dto.content,
        mediaUrls: dto.mediaUrls,
        mediaType,
        status: InstagramPostStatus.QUEUED,
      },
    });

    try {
      const result = await this.instagramPublisher.publish({
        content: dto.content,
        mediaUrls: dto.mediaUrls,
        mediaType: this.mapMediaType(mediaType),
        published: true,
      });

      return this.prisma.instagramPost.update({
        where: { id: post.id },
        data: {
          status: InstagramPostStatus.PUBLISHED,
          externalId: result.externalId,
          publishedAt: new Date(),
          responseMessage: result.detail,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to publish';
      return this.prisma.instagramPost.update({
        where: { id: post.id },
        data: {
          status: InstagramPostStatus.FAILED,
          responseMessage: message,
        },
      });
    }
  }

  async findAll(userId: string) {
    return this.prisma.instagramPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.instagramPost.findFirst({
      where: { id, userId },
    });
  }

  private mapMediaType(type: InstagramMediaType): string {
    return type as string;
  }
}

