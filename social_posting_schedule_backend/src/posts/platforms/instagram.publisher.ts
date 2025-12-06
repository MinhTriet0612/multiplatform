import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  PlatformPublisher,
  PublishPayload,
  PublishResult,
} from './platform.publisher';
import { SocialPlatformConfig } from '../config/social-platform.config';

enum MediaType {
  CAROUSEL = 'CAROUSEL',
  REELS = 'REELS',
  STORIES = 'STORIES',
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
      const mediaType = (payload.mediaType as MediaType) || MediaType.CAROUSEL;

      if (mediaType === MediaType.CAROUSEL) {
        return await this.publishCarousel(payload);
      } else if (mediaType === MediaType.REELS) {
        return await this.publishReels(payload);
      } else if (mediaType === MediaType.STORIES) {
        return await this.publishStories(payload);
      }

      throw new BadRequestException(`Invalid media type: ${mediaType}`);
    } catch (error) {
      this.logger.error(`Instagram publish error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async publishReels(payload: PublishPayload): Promise<PublishResult> {
    if (!payload.mediaUrls || payload.mediaUrls.length === 0) {
      throw new BadRequestException('Media URL is required for Reels');
    }

    const mediaUrl = payload.mediaUrls[0];

    // Step 1: Create media container
    const containerId = await this.createReelsContainer(mediaUrl, payload);

    // Step 2: Wait for container to be ready
    await this.waitForContainerReady(containerId);

    // Step 3: Publish the container
    const mediaId = await this.publishContainer(containerId);

    return {
      externalId: mediaId,
      detail: 'Instagram Reels published successfully',
    };
  }

  private async publishStories(payload: PublishPayload): Promise<PublishResult> {
    if (!payload.mediaUrls || payload.mediaUrls.length === 0) {
      throw new BadRequestException('Media URL is required for Stories');
    }

    const mediaUrl = payload.mediaUrls[0];

    // Step 1: Create media container
    const containerId = await this.createStoriesContainer(mediaUrl, payload);

    // Step 2: Wait for container to be ready (videos need processing)
    if (this.isVideoUrl(mediaUrl)) {
      await this.waitForContainerReady(containerId);
    }

    // Step 3: Publish the container
    const mediaId = await this.publishContainer(containerId);

    return {
      externalId: mediaId,
      detail: 'Instagram Stories published successfully',
    };
  }

  private async publishCarousel(payload: PublishPayload): Promise<PublishResult> {
    if (!payload.mediaUrls || payload.mediaUrls.length === 0) {
      throw new BadRequestException('Media URLs array is required for carousel posts');
    }

    if (payload.mediaUrls.length > 10) {
      throw new BadRequestException('Carousel posts can have maximum 10 items');
    }

    // Validate that all URLs are images (no videos in carousel)
    for (const mediaUrl of payload.mediaUrls) {
      if (this.isVideoUrl(mediaUrl)) {
        throw new BadRequestException(
          'Carousel only supports images. Please use Reels type for video content.'
        );
      }
    }

    // Carousel can have single or multiple items
    const isCarouselItem = payload.mediaUrls.length > 1;

    // Step 1: Create individual media containers
    const containerIds: string[] = [];
    for (const mediaUrl of payload.mediaUrls) {
      const containerId = await this.createCarouselItemContainer(
        mediaUrl,
        isCarouselItem,
        isCarouselItem ? undefined : payload.content,
        isCarouselItem ? undefined : payload.locationId,
      );
      containerIds.push(containerId);
    }

    // Step 2: Wait for all containers to be ready (images are usually instant)
    await Promise.all(
      containerIds.map((id) => this.waitForContainerReady(id)),
    );

    // Step 3: Single item carousel - publish directly
    if (!isCarouselItem) {
      const mediaId = await this.publishContainer(containerIds[0]);
      return {
        externalId: mediaId,
        detail: 'Instagram post published successfully',
      };
    }

    //If multiple items, create carousel container, otherwise publish single item
    const carouselContainerId = await this.createCarouselContainer(
      containerIds,
      payload.content,
      payload.locationId,
    );
    const mediaId = await this.publishContainer(carouselContainerId);
    return {
      externalId: mediaId,
      detail: 'Instagram carousel published successfully',
    };
  }

  private async createCarouselItemContainer(
    mediaUrl: string,
    isCarouselItem: boolean,
    caption?: string,
    locationId?: string,
  ): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/media`;
    const params: Record<string, string> = {
      access_token: this.config.instagramAccessToken,
      image_url: mediaUrl,
      media_type: 'IMAGE',
    };

    // Set is_carousel_item based on whether there are multiple items
    params.is_carousel_item = String(isCarouselItem);

    // Add caption for single item (not for carousel items)
    if (caption && !isCarouselItem) {
      params.caption = caption;
    }

    // Add location for single item (not for carousel items)
    if (locationId && !isCarouselItem) {
      params.location_id = locationId;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${url}?${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const errorMessage = error.error?.message || error.message || JSON.stringify(error);
      this.logger.error(`Failed to create carousel item container: ${errorMessage}`);
      throw new BadRequestException(`Instagram API error: ${errorMessage}`);
    }

    const data = await response.json();
    this.logger.log(`Carousel item container created: ${data.id}`);
    return data.id;
  }

  private async createReelsContainer(
    mediaUrl: string,
    payload: PublishPayload,
  ): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/media`;
    const params: Record<string, string> = {
      access_token: this.config.instagramAccessToken,
      video_url: mediaUrl,
      media_type: 'REELS',
      caption: payload.content || '',
    };

    // Reels-specific parameters
    if (payload.coverUrl) {
      params.cover_url = payload.coverUrl;
    }
    // share_to_feed defaults to true if not specified
    params.share_to_feed = payload.shareToFeed !== undefined ? String(payload.shareToFeed) : 'true';

    // Add location if provided
    if (payload.locationId) {
      params.location_id = payload.locationId;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${url}?${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const errorMessage = error.error?.message || error.message || JSON.stringify(error);
      this.logger.error(`Failed to create Reels container: ${errorMessage}`);
      throw new BadRequestException(`Instagram API error: ${errorMessage}`);
    }

    const data = await response.json();
    this.logger.log(`Reels container created: ${data.id}`);
    return data.id;
  }

  private async createStoriesContainer(
    mediaUrl: string,
    payload: PublishPayload,
  ): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/media`;
    const params: Record<string, string> = {
      access_token: this.config.instagramAccessToken,
      media_type: 'STORIES',
    };

    // Stories can be image or video
    if (this.isVideoUrl(mediaUrl)) {
      params.video_url = mediaUrl;
    } else {
      params.image_url = mediaUrl;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${url}?${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const errorMessage = error.error?.message || error.message || JSON.stringify(error);
      this.logger.error(`Failed to create Stories container: ${errorMessage}`);
      throw new BadRequestException(`Instagram API error: ${errorMessage}`);
    }

    const data = await response.json();
    this.logger.log(`Stories container created: ${data.id}`);
    return data.id;
  }

  private async createCarouselContainer(
    containerIds: string[],
    caption: string,
    locationId?: string,
  ): Promise<string> {
    const url = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/media`;
    const params: Record<string, string> = {
      access_token: this.config.instagramAccessToken,
      media_type: 'CAROUSEL',
      children: containerIds.join(','),
      caption: caption || '',
    };

    // Add location if provided
    if (locationId) {
      params.location_id = locationId;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${url}?${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const errorMessage = error.error?.message || error.message || JSON.stringify(error);
      this.logger.error(`Failed to create carousel container: ${errorMessage}`);
      throw new BadRequestException(`Instagram API error: ${errorMessage}`);
    }

    const data = await response.json();
    this.logger.log(`Carousel container created: ${data.id}`);
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
      console.log('Publish container response not ok:', response.json().then(data => console.log(data)));

      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const errorMessage = error.error?.message || error.message || JSON.stringify(error);
      this.logger.error(`Failed to publish container: ${errorMessage}`);
      throw new BadRequestException(`Instagram API error: ${errorMessage}`);
    }

    const data = await response.json();
    this.logger.log(`Media published successfully: ${data.id}`);
    return data.id;
  }

  private async waitForContainerReady(
    containerId: string,
    maxAttempts = 30,
    delayMs = 2000,
  ): Promise<void> {
    this.logger.log(`Waiting for container ${containerId} to be ready...`);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkContainerStatus(containerId);
      this.logger.log(`Container ${containerId} status check ${attempt + 1}/${maxAttempts}: ${status}`);

      if (status === 'FINISHED') {
        this.logger.log(`Container ${containerId} is ready`);
        return;
      }

      if (status === 'ERROR' || status === 'EXPIRED') {
        throw new BadRequestException(`Container ${containerId} failed with status: ${status}`);
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new BadRequestException(
      `Container ${containerId} did not become ready within ${maxAttempts} attempts. ` +
      `This may indicate the media is still processing. Please try again later.`,
    );
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
      const errorMessage = error.error?.message || error.message || JSON.stringify(error);
      this.logger.error(`Failed to check container status: ${errorMessage}`);
      throw new BadRequestException(`Instagram API error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.status_code || 'UNKNOWN';
  }


  private isVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.includes(ext));
  }
}
