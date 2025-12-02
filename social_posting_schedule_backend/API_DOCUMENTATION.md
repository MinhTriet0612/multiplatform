# Social Media Posting API Documentation

## Overview

API này hỗ trợ đăng bài lên Facebook và Instagram thông qua Meta Graph API. Media files (images/videos) phải được lưu trữ trên third-party storage (CDN, S3, etc.) và phải có URL công khai.

## Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# Facebook API Configuration
FACEBOOK_ACCESS_TOKEN=your-facebook-page-access-token
FACEBOOK_PAGE_ID=your-facebook-page-id
FACEBOOK_API_VERSION=v24.0

# Instagram API Configuration
# Option 1: Using Facebook Login (Recommended if Instagram is connected to Facebook Page)
# Leave INSTAGRAM_ACCESS_TOKEN empty - system will use FACEBOOK_ACCESS_TOKEN
INSTAGRAM_USER_ID=your-instagram-business-account-id
# System automatically uses graph.facebook.com for Facebook Login flow

# Option 2: Using Instagram Login (Separate Instagram access token)
# INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
# INSTAGRAM_USER_ID=your-instagram-business-account-id
# INSTAGRAM_GRAPH_URL=https://graph.instagram.com/v24.0

INSTAGRAM_API_VERSION=v24.0
```

## API Endpoints

### POST /posts/upload

Đăng bài lên các platform được chỉ định.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Nội dung bài đăng",
  "mediaUrls": ["https://example.com/image.jpg"],  // Single media: [url], Carousel: [url1, url2, ...] (max 10)
  "mediaType": "IMAGE",  // Optional: IMAGE, VIDEO, REELS, STORIES (auto-detect if not provided)
  "scheduledAt": "2024-01-01T12:00:00Z",  // Optional: If set, post will be scheduled (published = false)
  "platforms": ["FACEBOOK", "INSTAGRAM"]
}
```

**Lưu ý về Scheduled Posts:**
- Nếu `scheduledAt` được set → `published: false` và `scheduled_publish_time` được set
- Nếu `scheduledAt` không set → `published: true` (publish ngay)
- Facebook: Thời gian schedule phải từ 10 phút đến 30 ngày từ thời điểm request

**Lưu ý:**
- `mediaUrls` là array: `[url]` cho single media, `[url1, url2, ...]` cho carousel (Instagram only)
- Carousel tự động detect: nếu `mediaUrls.length > 1` → carousel
- Facebook không support carousel, chỉ dùng URL đầu tiên

**Response:**
```json
{
  "id": "post-id",
  "userId": "user-id",
  "content": "Nội dung bài đăng",
  "mediaUrl": "https://example.com/image.jpg",
  "status": "COMPLETED",
  "platforms": [
    {
      "id": "platform-id",
      "platform": "FACEBOOK",
      "status": "SUCCESS",
      "externalId": "fb_post_id",
      "responseMessage": "Facebook post published successfully"
    }
  ]
}
```

## Facebook Publishing

### Supported Post Types

1. **Text Post**: Chỉ có nội dung text (hoặc với link)
2. **Photo Post**: Image với message/caption
3. **Video Post**: Video với description

### Scheduled Posts

Facebook hỗ trợ scheduled posts:
- `published: true` (default): Publish ngay lập tức
- `published: false`: Schedule post
  - Cần `scheduled_publish_time` (Unix timestamp)
  - Thời gian schedule: từ 10 phút đến 30 ngày từ thời điểm request
  - Tự động convert từ `scheduledAt` (ISO 8601) sang Unix timestamp

### Facebook API Requirements

- **Access Token**: Page Access Token với permissions:
  - `pages_manage_engagement`
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `publish_video` (cho video posts)

### Facebook API Endpoints

- **Text Post**: `POST /{page_id}/feed` với `message`
- **Photo Post**: `POST /{page_id}/feed` với `message` và `url` (photo URL)
- **Video Post**: `POST /{page_id}/videos` với `file_url` và `description`

## Instagram Publishing

### Supported Post Types

1. **IMAGE**: Single image post
2. **VIDEO**: Single video post
3. **REELS**: Short-form video
4. **STORIES**: Story post (disappears after 24 hours)
5. **CAROUSEL**: Up to 10 images/videos in one post

### Instagram Publishing Flow

1. **Create Media Container**: Tạo container cho media
2. **Wait for Processing**: Đợi container sẵn sàng (cho videos)
3. **Publish Container**: Đăng container lên Instagram

### Instagram API Requirements

#### Using Facebook Login (Recommended)
- **Access Token**: Facebook Page Access Token (cùng token với Facebook)
- **Host URL**: `graph.facebook.com` (tự động)
- **Permissions**:
  - `instagram_basic` hoặc `instagram_business_basic`
  - `instagram_content_publish` hoặc `instagram_business_content_publish`
  - `pages_read_engagement`
  - `pages_manage_metadata` (nếu cần)
- **Instagram User ID**: Instagram Business Account ID được kết nối với Facebook Page
  - Có thể lấy bằng: `GET /{page-id}?fields=instagram_business_account`

#### Using Instagram Login
- **Access Token**: Instagram User Access Token (riêng biệt)
- **Host URL**: `graph.instagram.com` (set `INSTAGRAM_GRAPH_URL`)
- **Permissions**:
  - `instagram_business_basic`
  - `instagram_business_content_publish`

### Rate Limits

- Instagram: 100 posts per 24-hour moving period
- Carousel posts count as 1 post

## Media Storage Requirements

### Third-Party Storage

Media files phải được lưu trữ trên public server/CDN:
- AWS S3 với public access
- Cloudinary
- Imgur
- Any CDN với public URLs

### Supported Formats

**Images:**
- JPEG (MPO và JPS không được hỗ trợ)

**Videos:**
- MP4, MOV, AVI, MKV, WebM, FLV

### URL Requirements

- URLs phải publicly accessible
- HTTPS recommended
- Meta sẽ cURL media từ URL này

## Error Handling

API sẽ trả về errors với format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common errors:
- `Facebook configuration is missing`: Thiếu Facebook env variables
- `Instagram configuration is missing`: Thiếu Instagram env variables
- `Media URL is required`: Thiếu media URL cho Instagram posts
- `Carousel posts can have maximum 10 items`: Carousel quá 10 items

## Examples

### Example 1: Facebook Text Post (Publish Immediately)
```json
{
  "content": "Hello Facebook!",
  "platforms": ["FACEBOOK"]
}
```

### Example 1b: Facebook Scheduled Post
```json
{
  "content": "This will be published later",
  "scheduledAt": "2024-12-25T10:00:00Z",
  "platforms": ["FACEBOOK"]
}
```

### Example 2: Facebook Photo + Message
```json
{
  "content": "Check out this amazing photo!",
  "mediaUrls": ["https://cdn.example.com/image.jpg"],
  "platforms": ["FACEBOOK"]
}
```

### Example 2b: Facebook Scheduled Photo Post
```json
{
  "content": "Scheduled photo post",
  "mediaUrls": ["https://cdn.example.com/image.jpg"],
  "scheduledAt": "2024-12-25T10:00:00Z",
  "platforms": ["FACEBOOK"]
}
```

### Example 3: Instagram Image Post
```json
{
  "content": "Check out this image!",
  "mediaUrls": ["https://cdn.example.com/image.jpg"],
  "mediaType": "IMAGE",
  "platforms": ["INSTAGRAM"]
}
```

### Example 3: Instagram Carousel (Auto-detected)
```json
{
  "content": "My carousel post",
  "mediaUrls": [
    "https://cdn.example.com/img1.jpg",
    "https://cdn.example.com/img2.jpg",
    "https://cdn.example.com/img3.jpg"
  ],
  "platforms": ["INSTAGRAM"]
}
```
*Note: Carousel tự động detect khi `mediaUrls.length > 1`*

### Example 4: Instagram Reels
```json
{
  "content": "Check out my reel!",
  "mediaUrls": ["https://cdn.example.com/video.mp4"],
  "mediaType": "REELS",
  "platforms": ["INSTAGRAM"]
}
```

### Example 5: Multi-Platform Post
```json
{
  "content": "Posting to both platforms",
  "mediaUrls": ["https://cdn.example.com/image.jpg"],
  "platforms": ["FACEBOOK", "INSTAGRAM"]
}
```
*Note: Facebook chỉ dùng URL đầu tiên, không support carousel*

## Notes

- Media URLs phải accessible tại thời điểm publish
- Instagram videos cần thời gian xử lý (thường 1-5 phút)
- Carousel items sẽ được crop theo aspect ratio của item đầu tiên
- Stories sẽ tự động disappear sau 24 giờ

