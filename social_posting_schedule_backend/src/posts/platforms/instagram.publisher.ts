import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  PlatformPublisher,
  PublishPayload,
  PublishResult,
} from './platform.publisher';
import { SocialPlatformConfig } from '../config/social-platform.config';

enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  REELS = 'REELS',
  STORIES = 'STORIES',
  CAROUSEL = 'CAROUSEL',
}

@Injectable()
export class InstagramPublisher extends PlatformPublisher {
  private readonly logger = new Logger(InstagramPublisher.name);

  constructor(private readonly config: SocialPlatformConfig) {
    super();
  }

  async publish(payload: PublishPayload): Promise<PublishResult> {
    if (!this.config.validateInstagramConfig()) {
      const missing: string[] = [];
      if (!this.config.instagramAccessToken) missing.push('access token');
      if (!this.config.instagramUserId) missing.push('Instagram User ID');
      throw new BadRequestException(
        `Instagram configuration is missing: ${missing.join(', ')}. ` +
        `Note: When using Facebook Login, Instagram uses Facebook Page access token. ` +
        `Set INSTAGRAM_USER_ID to your Instagram Business Account ID connected to your Facebook Page.`
      );
    }

    try {
      // Auto-detect carousel: length > 1 = carousel
      const isCarousel = payload.mediaUrls && payload.mediaUrls.length > 1;

      if (isCarousel) {
        return await this.publishCarousel(payload);
      } else {
        const detectedType = this.detectMediaType(payload);
        const mediaType = (payload.mediaType as MediaType) || detectedType;
        return await this.publishSingleMedia(payload, mediaType);
      }
    } catch (error) {
      this.logger.error(`Instagram publish error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async publishSingleMedia(
    payload: PublishPayload,
    mediaType: MediaType,
  ): Promise<PublishResult> {
    if (!payload.mediaUrls || payload.mediaUrls.length === 0) {
      throw new BadRequestException('Media URL is required for Instagram posts');
    }

    const mediaUrl = payload.mediaUrls[0];

    // Step 1: Create media container
    const containerId = await this.createMediaContainer(mediaUrl, payload, mediaType);

    // Step 2: Wait for container to be ready (only for videos/reels, images are instant)
    if (mediaType === MediaType.VIDEO || mediaType === MediaType.REELS) {
      await this.waitForContainerReady(containerId);
    }

    // Step 3: Publish the container
    const mediaId = await this.publishContainer(containerId);

    return {
      externalId: mediaId,
      detail: `Instagram ${mediaType.toLowerCase()} published successfully`,
    };
  }

  private async publishCarousel(payload: PublishPayload): Promise<PublishResult> {
    if (!payload.mediaUrls || payload.mediaUrls.length === 0) {
      throw new BadRequestException('Media URLs array is required for carousel posts');
    }

    if (payload.mediaUrls.length > 10) {
      throw new BadRequestException('Carousel posts can have maximum 10 items');
    }

    if (!payload.mediaUrls || payload.mediaUrls.length === 0) {
      throw new BadRequestException('Media URLs array is required for carousel posts');
    }

    if (payload.mediaUrls.length > 10) {
      throw new BadRequestException('Carousel posts can have maximum 10 items');
    }

    // Step 1: Create individual media containers
    const containerIds: string[] = [];
    for (const mediaUrl of payload.mediaUrls) {
      const isVideo = this.isVideoUrl(mediaUrl);
      const mediaType = isVideo ? MediaType.VIDEO : MediaType.IMAGE;
      const containerId = await this.createMediaContainer(
        mediaUrl,
        payload,
        mediaType,
        true, // is_carousel_item
      );
      containerIds.push(containerId);
    }

    // Step 2: Wait for all containers to be ready
    await Promise.all(
      containerIds.map((id) => this.waitForContainerReady(id)),
    );

    // Step 3: Create carousel container
    const carouselContainerId = await this.createCarouselContainer(
      containerIds,
      payload.content,
    );

    // Step 4: Publish carousel
    const mediaId = await this.publishContainer(carouselContainerId);

    return {
      externalId: mediaId,
      detail: 'Instagram carousel published successfully',
    };
  }

  private async createMediaContainer(
    mediaUrl: string,
    payload: PublishPayload,
    mediaType: MediaType,
    isCarouselItem = false,
  ): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/media`;
    const params: Record<string, string> = {
      access_token: this.config.instagramAccessToken,
      media_type: mediaType,
    };

    if (isCarouselItem) {
      params.is_carousel_item = 'true';
    }

    if (mediaType === MediaType.IMAGE || mediaType === MediaType.STORIES) {
      params.image_url = mediaUrl;
    } else if (
      mediaType === MediaType.VIDEO ||
      mediaType === MediaType.REELS
    ) {
      params.video_url = mediaUrl;
    }

    if (payload.content && !isCarouselItem) {
      params.caption = payload.content;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${url}?${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Instagram API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async createCarouselContainer(
    containerIds: string[],
    caption: string,
  ): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/media`;
    const params = new URLSearchParams({
      access_token: this.config.instagramAccessToken,
      media_type: MediaType.CAROUSEL,
      children: containerIds.join(','),
      caption: caption || '',
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Instagram API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async publishContainer(containerId: string): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/media_publish`;
    const params = new URLSearchParams({
      access_token: this.config.instagramAccessToken,
      creation_id: containerId,
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Instagram API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async waitForContainerReady(
    containerId: string,
    maxAttempts = 5,
    delayMs = 60000, // 60 seconds as recommended by Meta
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkContainerStatus(containerId);

      if (status === 'FINISHED') {
        return;
      }

      if (status === 'ERROR' || status === 'EXPIRED') {
        throw new Error(`Container ${containerId} failed with status: ${status}`);
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error(`Container ${containerId} did not become ready within ${maxAttempts} attempts`);
  }

  private async checkContainerStatus(containerId: string): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${containerId}`;
    const params = new URLSearchParams({
      access_token: this.config.instagramAccessToken,
      fields: 'status_code',
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Instagram API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.status_code;
  }

  private detectMediaType(payload: PublishPayload): MediaType {
    if (!payload.mediaUrls || payload.mediaUrls.length === 0) {
      throw new BadRequestException('Media URL is required');
    }

    const mediaUrl = payload.mediaUrls[0];
    if (this.isVideoUrl(mediaUrl)) {
      return payload.mediaType === MediaType.REELS
        ? MediaType.REELS
        : payload.mediaType === MediaType.STORIES
          ? MediaType.STORIES
          : MediaType.VIDEO;
    }

    return payload.mediaType === MediaType.STORIES
      ? MediaType.STORIES
      : MediaType.IMAGE;
  }

  private isVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.includes(ext));
  }
}
