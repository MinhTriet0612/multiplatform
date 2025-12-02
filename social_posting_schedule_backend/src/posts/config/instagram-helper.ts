import { Injectable } from '@nestjs/common';
import { SocialPlatformConfig } from './social-platform.config';

/**
 * Helper service to get Instagram Business Account ID from Facebook Page
 * Useful when setting up Instagram API with Facebook Login
 */
@Injectable()
export class InstagramHelper {
  constructor(private readonly config: SocialPlatformConfig) {}

  /**
   * Get Instagram Business Account ID from connected Facebook Page
   * @returns Instagram Business Account ID (IG_ID)
   */
  async getInstagramUserIdFromPage(): Promise<string | null> {
    if (!this.config.validateFacebookConfig()) {
      throw new Error('Facebook configuration is required');
    }

    try {
      const url = `${this.config.facebookGraphUrl}/${this.config.facebookPageId}`;
      const params = new URLSearchParams({
        fields: 'instagram_business_account',
        access_token: this.config.facebookAccessToken,
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(`Facebook API error: ${error.error?.message || JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.instagram_business_account?.id || null;
    } catch (error) {
      console.error('Error getting Instagram User ID from Page:', error);
      return null;
    }
  }

  /**
   * Validate Instagram Business Account connection to Facebook Page
   * @returns true if Instagram account is connected
   */
  async validateInstagramConnection(): Promise<boolean> {
    const igUserId = await this.getInstagramUserIdFromPage();
    return igUserId !== null;
  }
}

