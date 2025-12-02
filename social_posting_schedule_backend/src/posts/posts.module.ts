import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FacebookController } from './controllers/facebook.controller';
import { InstagramController } from './controllers/instagram.controller';
import { TikTokController } from './controllers/tiktok.controller';
import { FacebookService } from './services/facebook.service';
import { InstagramService } from './services/instagram.service';
import { TikTokService } from './services/tiktok.service';
import { FacebookPublisher } from './platforms/facebook.publisher';
import { InstagramPublisher } from './platforms/instagram.publisher';
import { TiktokPublisher } from './platforms/tiktok.publisher';
import { SocialPlatformConfig } from './config/social-platform.config';

@Module({
  imports: [PrismaModule],
  controllers: [FacebookController, InstagramController, TikTokController],
  providers: [
    FacebookService,
    InstagramService,
    TikTokService,
    SocialPlatformConfig,
    FacebookPublisher,
    InstagramPublisher,
    TiktokPublisher,
  ],
})
export class PostsModule {}
