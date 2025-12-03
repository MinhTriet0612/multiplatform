export interface PublishPayload {
  content: string;
  mediaUrls?: string[]; // Single: [url], Carousel: [url1, url2, ...]
  mediaType?: string; // Platform-specific media type
  published?: boolean; // For Facebook: true = publish immediately, false = schedule
  scheduledAt?: Date; // Scheduled publish time (required if published = false)
  
  // Instagram-specific fields
  coverUrl?: string; // Cover image URL for Reels
  shareToFeed?: boolean; // For Reels: whether to share to main feed (default: true)
  locationId?: string; // Instagram location ID for location tagging
}

export interface PublishResult {
  externalId?: string | null;
  detail?: string;
}

export abstract class PlatformPublisher {
  abstract publish(payload: PublishPayload): Promise<PublishResult>;
}
