# Tóm Tắt Implementation - Facebook & Instagram API

## Tổng Quan

Đã implement API đăng bài lên Facebook và Instagram theo tài liệu chính thức của Meta. Hệ thống hỗ trợ:
- Facebook: Text posts, Photo posts, Video posts
- Instagram: Image, Video, Reels, Stories, Carousel (tối đa 10 items)

## Cấu Trúc Code

### 1. Config Service (`social-platform.config.ts`)
- Quản lý access tokens và API URLs từ environment variables
- Validation cho Facebook và Instagram configs
- **Facebook Login cho Instagram**: Tự động dùng Facebook Page access token nếu `INSTAGRAM_ACCESS_TOKEN` không được set
- **Instagram Graph URL**: Mặc định dùng `graph.facebook.com` cho Facebook Login, có thể override bằng `INSTAGRAM_GRAPH_URL`

### 2. Facebook Publisher (`facebook.publisher.ts`)
- **Text Posts**: POST đến `/{page-id}/feed`
- **Photo Posts**: POST đến `/{page-id}/photos` với `url` parameter
- **Video Posts**: POST đến `/{page-id}/videos` với `file_url` parameter
- Tự động detect video dựa trên file extension

### 3. Instagram Publisher (`instagram.publisher.ts`)
- **Single Media Flow**:
  1. Tạo media container (`/{ig-user-id}/media`)
  2. Đợi container ready (chỉ cho videos/reels, images instant)
  3. Publish container (`/{ig-user-id}/media_publish`)

- **Carousel Flow**:
  1. Tạo containers cho từng media item
  2. Đợi tất cả containers ready
  3. Tạo carousel container với `children` parameter
  4. Publish carousel container

- **Media Types Supported**:
  - `IMAGE`: Single image
  - `VIDEO`: Single video
  - `REELS`: Short-form video
  - `STORIES`: Story post
  - `CAROUSEL`: Up to 10 items

### 4. DTO Updates (`create-post.dto.ts`)
- **Tối ưu hóa**: Chỉ dùng `mediaUrls` array (không còn `mediaUrl` riêng)
- Single media: `mediaUrls: [url]`
- Carousel: `mediaUrls: [url1, url2, ...]` (tự động detect khi length > 1)
- Thêm `MediaType` enum (optional, auto-detect nếu không set)

## Environment Variables Cần Thiết

```env
# Facebook
FACEBOOK_ACCESS_TOKEN=your-page-access-token
FACEBOOK_PAGE_ID=your-page-id
FACEBOOK_API_VERSION=v24.0

# Instagram - Option 1: Using Facebook Login (Recommended)
# Khi Instagram được tích hợp vào Facebook Page, chỉ cần:
INSTAGRAM_USER_ID=your-ig-business-account-id
# System tự động dùng FACEBOOK_ACCESS_TOKEN và graph.facebook.com

# Instagram - Option 2: Using Instagram Login (Separate)
# INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
# INSTAGRAM_USER_ID=your-ig-business-account-id
# INSTAGRAM_GRAPH_URL=https://graph.instagram.com/v24.0

INSTAGRAM_API_VERSION=v24.0
```

### Lấy Instagram User ID từ Facebook Page

Nếu bạn đã tích hợp Instagram vào Facebook Page, có thể lấy Instagram User ID bằng:

```bash
curl "https://graph.facebook.com/v24.0/{page-id}?fields=instagram_business_account&access_token={page-access-token}"
```

Response sẽ có `instagram_business_account.id` - đó chính là `INSTAGRAM_USER_ID`.

## Đặc Điểm Kỹ Thuật

### Media Storage
- Media files phải được lưu trên third-party storage (CDN, S3, Cloudinary, etc.)
- URLs phải publicly accessible
- Meta sẽ cURL media từ URLs này

### Error Handling
- Comprehensive error handling với logging
- Validation cho config và payload
- Clear error messages

### Rate Limits
- Instagram: 100 posts/24h (carousel = 1 post)
- Facebook: Theo Page limits

### Video Processing
- Instagram videos cần thời gian xử lý (1-5 phút)
- Hệ thống tự động check status mỗi 60 giây, tối đa 5 lần
- Images được publish ngay lập tức

## API Usage

### Example Request
```json
POST /posts/upload
{
  "content": "Nội dung bài đăng",
  "mediaUrl": "https://cdn.example.com/image.jpg",
  "mediaType": "IMAGE",
  "platforms": ["FACEBOOK", "INSTAGRAM"]
}
```

### Example Response
```json
{
  "id": "post-id",
  "status": "COMPLETED",
  "platforms": [
    {
      "platform": "FACEBOOK",
      "status": "SUCCESS",
      "externalId": "fb_post_id"
    },
    {
      "platform": "INSTAGRAM",
      "status": "SUCCESS",
      "externalId": "ig_media_id"
    }
  ]
}
```

## Notes

1. **Access Tokens**: Phải là Page Access Token (Facebook) hoặc Instagram User Access Token
2. **Permissions**: Cần đúng permissions cho mỗi platform
3. **Media URLs**: Phải accessible tại thời điểm publish
4. **Carousel**: Tối đa 10 items, aspect ratio theo item đầu tiên
5. **Stories**: Tự động disappear sau 24h

## Testing

Để test API:
1. Setup environment variables
2. Đảm bảo media URLs accessible
3. Gửi POST request đến `/posts/upload`
4. Check response và database records

## Next Steps (Optional)

- [ ] Implement resumable video upload cho large files
- [ ] Add rate limit checking endpoint
- [ ] Add webhook support cho status updates
- [ ] Add support cho user tags và location tags
- [ ] Implement retry logic cho failed publishes

