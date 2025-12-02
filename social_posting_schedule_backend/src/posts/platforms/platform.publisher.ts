export interface PublishPayload {
  content: string;
  mediaUrls?: string[]; // Single: [url], Carousel: [url1, url2, ...]
  mediaType?: string; // Platform-specific media type
  published?: boolean; // For Facebook: true = publish immediately, false = schedule
  scheduledAt?: Date; // Scheduled publish time (required if published = false)
}

export interface PublishResult {
  externalId?: string | null;
  detail?: string;
}

export abstract class PlatformPublisher {
  abstract publish(payload: PublishPayload): Promise<PublishResult>;
}
