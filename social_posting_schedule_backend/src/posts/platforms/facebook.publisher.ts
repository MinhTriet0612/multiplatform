import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  PlatformPublisher,
  PublishPayload,
  PublishResult,
} from './platform.publisher';
import { SocialPlatformConfig } from '../config/social-platform.config';

@Injectable()
export class FacebookPublisher extends PlatformPublisher {
  private readonly logger = new Logger(FacebookPublisher.name);

  constructor(private readonly config: SocialPlatformConfig) {
    super();
  }

  async publish(payload: PublishPayload): Promise<PublishResult> {
    if (!this.config.validateFacebookConfig()) {
      throw new BadRequestException('Facebook configuration is missing');
    }

    try {
      // Facebook doesn't support carousel, use first media URL if available
      const mediaUrl = payload.mediaUrls && payload.mediaUrls.length > 0 ? payload.mediaUrls[0] : undefined;

      if (mediaUrl) {
        const isVideo = this.isVideoUrl(mediaUrl);
        if (isVideo) {
          return await this.publishVideo(mediaUrl, payload);
        } else {
          return await this.publishPhoto(mediaUrl, payload);
        }
      } else {
        return await this.publishTextPost(payload);
      }
    } catch (error) {
      this.logger.error(`Facebook publish error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async publishTextPost(payload: PublishPayload): Promise<PublishResult> {
    const url = `${this.config.facebookGraphUrl}/${this.config.facebookPageId}/feed`;
    const params = new URLSearchParams({
      message: payload.content,
      access_token: this.config.facebookAccessToken,
    });

    // Add published parameter (default to true if not specified)
    const published = payload.published !== undefined ? payload.published : true;
    params.append('published', published.toString());

    // Add scheduled_publish_time if published = false
    if (!published) {
      if (!payload.scheduledAt) {
        throw new BadRequestException('scheduled_publish_time is required when published is false');
      }
      const unixTimestamp = Math.floor(payload.scheduledAt.getTime() / 1000);
      params.append('scheduled_publish_time', unixTimestamp.toString());
    }

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Facebook API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      externalId: data.id,
      detail: published ? 'Facebook post published successfully' : 'Facebook post scheduled successfully',
    };
  }

  private async publishPhoto(mediaUrl: string, payload: PublishPayload): Promise<PublishResult> {
    // Use /feed endpoint for photo + message with scheduling support
    // Alternative: /photos endpoint with caption (but no scheduling support)
    const url = `${this.config.facebookGraphUrl}/${this.config.facebookPageId}/feed`;
    const params = new URLSearchParams({
      message: payload.content,
      url: mediaUrl, // Photo URL
      access_token: this.config.facebookAccessToken,
    });

    // Add published parameter (default to true if not specified)
    const published = payload.published !== undefined ? payload.published : true;
    params.append('published', published.toString());

    // Add scheduled_publish_time if published = false
    if (!published) {
      if (!payload?.scheduledAt) {
        throw new BadRequestException('scheduled_publish_time is required when published is false');
      }
      const unixTimestamp = Math.floor(payload.scheduledAt.getTime() / 1000);
      params.append('scheduled_publish_time', unixTimestamp.toString());
    }

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Facebook API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      externalId: data.id,
      detail: published ? 'Facebook photo published successfully' : 'Facebook photo scheduled successfully',
    };
  }

  private async publishVideo(mediaUrl: string, payload: PublishPayload): Promise<PublishResult> {
    const url = `${this.config.facebookGraphUrl}/${this.config.facebookPageId}/videos`;
    const params = new URLSearchParams({
      file_url: mediaUrl,
      description: payload.content,
      access_token: this.config.facebookAccessToken,
    });

    // Add published parameter (default to true if not specified)
    const published = payload.published !== undefined ? payload.published : true;
    params.append('published', published.toString());

    // Add scheduled_publish_time if published = false
    if (!published) {
      if (!payload.scheduledAt) {
        throw new BadRequestException('scheduled_publish_time is required when published is false');
      }
      const unixTimestamp = Math.floor(payload.scheduledAt.getTime() / 1000);
      params.append('scheduled_publish_time', unixTimestamp.toString());
    }

    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Facebook API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      externalId: data.id,
      detail: published ? 'Facebook video published successfully' : 'Facebook video scheduled successfully',
    };
  }

  private isVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.includes(ext));
  }
}
