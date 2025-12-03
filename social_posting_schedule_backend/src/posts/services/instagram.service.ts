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
  ) { }

  async upload(userId: string, dto: CreateInstagramPostDto) {
    // Default to CAROUSEL if not specified
    const mediaType = dto.mediaType || InstagramMediaType.CAROUSEL;

    const post = await this.prisma.instagramPost.create({
      data: {
        userId,
        groupId: dto.groupId,
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
        coverUrl: dto.coverUrl,
        shareToFeed: dto.shareToFeed,
        locationId: dto.locationId,
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

  async repost(id: string, userId: string, dto: CreateInstagramPostDto) {
    const existing = await this.prisma.instagramPost.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    // Default to CAROUSEL if not specified
    const mediaType = dto.mediaType || InstagramMediaType.CAROUSEL;

    console.log('Reposting Instagram post:', {
      id,
      userId,
      dto,
      mediaType,
    })

    try {
      const result = await this.instagramPublisher.publish({
        content: dto.content,
        mediaUrls: dto.mediaUrls,
        mediaType: this.mapMediaType(mediaType),
        published: true,
        coverUrl: dto.coverUrl,
        shareToFeed: dto.shareToFeed,
        locationId: dto.locationId,
      });

      return this.prisma.instagramPost.update({
        where: { id: existing.id },
        data: {
          content: dto.content,
          mediaUrls: dto.mediaUrls,
          mediaType,
          groupId: dto.groupId ?? existing.groupId,
          status: InstagramPostStatus.PUBLISHED,
          externalId: result.externalId,
          publishedAt: new Date(),
          responseMessage: result.detail,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to publish';
      return this.prisma.instagramPost.update({
        where: { id: existing.id },
        data: {
          content: dto.content,
          mediaUrls: dto.mediaUrls,
          mediaType,
          groupId: dto.groupId ?? existing.groupId,
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

