import { Injectable } from '@nestjs/common';
import {
  PlatformPublisher,
  PublishPayload,
  PublishResult,
} from './platform.publisher';

@Injectable()
export class TiktokPublisher extends PlatformPublisher {
  async publish(payload: PublishPayload): Promise<PublishResult> {
    void payload;
    return {
      externalId: `tt_${Date.now()}`,
      detail: 'Tiktok publish simulated',
    };
  }
}
