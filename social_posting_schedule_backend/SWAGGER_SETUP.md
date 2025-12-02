# Swagger API Documentation Setup

## Overview

Swagger/OpenAPI documentation đã được tích hợp vào project. API documentation có thể truy cập tại `/api` endpoint khi server chạy.

## Access Swagger UI

Sau khi start server:

```bash
npm run start:dev
```

Truy cập Swagger UI tại:
- **URL**: `http://localhost:3000/api`
- **Swagger JSON**: `http://localhost:3000/api-json`

## Features

### 1. **Authentication**
- JWT Bearer Token authentication được setup
- Click "Authorize" button trong Swagger UI để nhập token
- Token sẽ được persist trong session

### 2. **API Tags**
- `auth`: Authentication endpoints (register, login, profile)
- `posts`: Post management endpoints (upload)

### 3. **Validation**
- DTOs có validation decorators từ `class-validator`
- Request validation tự động với `ValidationPipe`
- Error responses được document trong Swagger

## API Endpoints Documented

### Auth Endpoints

#### POST `/auth/register`
- Register new user
- Request body: `RegisterDto`
- Responses: 201, 400, 409

#### POST `/auth/login`
- Login user
- Request body: `LoginDto`
- Responses: 200, 401
- Returns: `{ access_token, user }`

#### GET `/auth/profile`
- Get current user profile
- Requires: JWT Bearer Token
- Responses: 200, 401

### Posts Endpoints

#### POST `/posts/upload`
- Upload and publish post to social media platforms
- Requires: JWT Bearer Token
- Request body: `CreatePostDto`
- Supports:
  - Single media: `mediaUrls: ["url"]`
  - Carousel: `mediaUrls: ["url1", "url2", ...]` (auto-detected when length > 1)
  - Media types: IMAGE, VIDEO, REELS, STORIES
- Responses: 201, 400, 401

## DTOs with Swagger Decorators

### CreatePostDto
- `content`: string (required, max 2200 chars)
- `mediaUrls`: string[] (optional, max 10 items)
- `mediaType`: MediaType enum (optional, auto-detect)
- `scheduledAt`: Date (optional, ISO 8601)
- `platforms`: Platform[] (required, min 1 item)

### LoginDto
- `email`: string (required, email format)
- `password`: string (required, min 6 chars)

### RegisterDto
- `email`: string (required, email format)
- `password`: string (required, min 6 chars)
- `name`: string (optional)

## Testing with Swagger UI

1. **Start server**: `npm run start:dev`
2. **Open Swagger UI**: `http://localhost:3000/api`
3. **Register/Login**: 
   - Use `/auth/register` to create account
   - Use `/auth/login` to get JWT token
4. **Authorize**:
   - Click "Authorize" button (top right)
   - Enter JWT token: `Bearer <your-token>`
   - Click "Authorize"
5. **Test endpoints**:
   - Try `/posts/upload` with different payloads
   - See request/response examples in Swagger UI

## Example Request Bodies

### Single Media Post
```json
{
  "content": "Check out this image!",
  "mediaUrls": ["https://cdn.example.com/image.jpg"],
  "mediaType": "IMAGE",
  "platforms": ["FACEBOOK", "INSTAGRAM"]
}
```

### Carousel Post (Auto-detected)
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

### Video/Reels Post
```json
{
  "content": "Check out my reel!",
  "mediaUrls": ["https://cdn.example.com/video.mp4"],
  "mediaType": "REELS",
  "platforms": ["INSTAGRAM"]
}
```

## Configuration

Swagger được config trong `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Social Posting Schedule API')
  .setDescription('API for scheduling and publishing posts to Facebook and Instagram')
  .setVersion('1.0')
  .addBearerAuth(..., 'JWT-auth')
  .addTag('posts', 'Post management endpoints')
  .addTag('auth', 'Authentication endpoints')
  .build();
```

## Notes

- Swagger UI persist authorization tokens across page refreshes
- All endpoints có example requests/responses
- Validation errors sẽ được return với proper status codes
- DTOs có type safety với TypeScript và runtime validation

