import { Injectable } from '@nestjs/common';
import { SocialPlatformConfig } from '../config/social-platform.config';

@Injectable()
export class PlatformInsightsService {
  constructor(private readonly config: SocialPlatformConfig) { }

  async getFacebookPageInsights() {
    if (!this.config.validateFacebookConfig()) {
      throw new Error('Facebook configuration is missing');
    }

    const url = `${this.config.facebookGraphUrl}/${this.config.facebookPageId}/insights`;

    // Use supported metrics: views and engagement
    const params = new URLSearchParams({
      // Replace deprecated metrics with current ones
      metric: [
        'page_views_total',       // total views
        'page_engaged_users',     // engaged users
        'page_total_actions',     // total actions (CTA clicks)
        'page_followers'          // replacement for page_fans
        // optionally: 'page_impressions' depending on API version
      ].join(','),
      period: 'lifetime',
      access_token: this.config.facebookAccessToken,
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Facebook Page Insights API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    return response.json();
  }

  async getInstagramAccountInsights() {
    if (!this.config.validateInstagramConfig()) {
      throw new Error('Instagram configuration is missing');
    }

    const baseUrl = `${this.config.instagramGraphUrl}/${this.config.instagramUserId}/insights`;
    const token = this.config.instagramAccessToken;

    // 1️⃣ Metrics that require metric_type=total_value
    const totalValueParams = new URLSearchParams({
      metric: 'profile_views,website_clicks',
      metric_type: 'total_value',
      period: 'day',
      access_token: token,
    });

    // 2️⃣ Metrics that require metric_type=time_series
    const timeSeriesParams = new URLSearchParams({
      metric: 'reach',
      metric_type: 'time_series',
      period: 'day',
      access_token: token,
    });

    const [totalValueRes, timeSeriesRes] = await Promise.all([
      fetch(`${baseUrl}?${totalValueParams.toString()}`),
      fetch(`${baseUrl}?${timeSeriesParams.toString()}`),
    ]);

    // Error handling
    if (!totalValueRes.ok) {
      const err = await totalValueRes.json().catch(() => null);
      throw new Error(
        `Instagram total_value insights error: ${err?.error?.message || 'Unknown error'}`
      );
    }

    if (!timeSeriesRes.ok) {
      const err = await timeSeriesRes.json().catch(() => null);
      throw new Error(
        `Instagram time_series insights error: ${err?.error?.message || 'Unknown error'}`
      );
    }

    const totalValueData = await totalValueRes.json();
    const timeSeriesData = await timeSeriesRes.json();

    // ✅ Merge responses into one object
    return {
      data: [
        ...(totalValueData.data || []),
        ...(timeSeriesData.data || []),
      ],
    };
  }
}

