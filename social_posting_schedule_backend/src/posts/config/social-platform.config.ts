import { Injectable } from '@nestjs/common';

@Injectable()
export class SocialPlatformConfig {
  // Facebook API Configuration
  get facebookAccessToken(): string {
    return process.env.FACEBOOK_ACCESS_TOKEN || '';
  }

  get facebookPageId(): string {
    return process.env.FACEBOOK_PAGE_ID || '';
  }

  get facebookApiVersion(): string {
    return process.env.FACEBOOK_API_VERSION || 'v24.0';
  }

  get facebookGraphUrl(): string {
    return `https://graph.facebook.com/${this.facebookApiVersion}`;
  }

  // Instagram API Configuration
  // When using Facebook Login, Instagram uses Facebook Page access token
  get instagramAccessToken(): string {
    // If INSTAGRAM_ACCESS_TOKEN is set, use it; otherwise use Facebook token (Facebook Login flow)
    return process.env.INSTAGRAM_ACCESS_TOKEN || this.facebookAccessToken;
  }

  get instagramUserId(): string {
    return process.env.INSTAGRAM_USER_ID || '';
  }

  get instagramApiVersion(): string {
    return process.env.INSTAGRAM_API_VERSION || this.facebookApiVersion;
  }

  // Instagram API with Facebook Login uses graph.facebook.com
  // Instagram API with Instagram Login uses graph.instagram.com
  get instagramGraphUrl(): string {
    if (process.env.INSTAGRAM_GRAPH_URL) {
      return process.env.INSTAGRAM_GRAPH_URL;
    }
    // Default to graph.facebook.com for Facebook Login flow
    // If using Instagram Login, set INSTAGRAM_GRAPH_URL=https://graph.instagram.com/v24.0
    return `https://graph.facebook.com/${this.instagramApiVersion}`;
  }

  get instagramUploadUrl(): string {
    return `https://rupload.facebook.com/ig-api-upload/${this.instagramApiVersion}`;
  }

  // Check if using Facebook Login for Instagram (same token)
  get isInstagramUsingFacebookLogin(): boolean {
    return !process.env.INSTAGRAM_ACCESS_TOKEN && !!this.facebookAccessToken;
  }

  validateFacebookConfig(): boolean {
    return !!(this.facebookAccessToken && this.facebookPageId);
  }

  validateInstagramConfig(): boolean {
    // Instagram can use either its own token or Facebook token (Facebook Login flow)
    return !!(this.instagramAccessToken && this.instagramUserId);
  }
}

