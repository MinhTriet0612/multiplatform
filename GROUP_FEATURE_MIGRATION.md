# Group Feature Migration Guide

## Overview

This document describes the new "Group" feature that represents campaigns. Groups can contain multiple posts from different platforms (Facebook, Instagram, TikTok).

## Database Migration

After updating the Prisma schema, you need to run the migration:

```bash
cd social_posting_schedule_backend
npx prisma migrate dev --name add_group_feature
```

This will:
1. Create the `groups` table
2. Add `groupId` column to `facebook_posts`, `instagram_posts`, and `tiktok_posts` tables
3. Set up foreign key relationships

## Regenerate Prisma Client

After migration, regenerate the Prisma client:

```bash
npx prisma generate
```

## New Features

### Backend

1. **Group Model**: New model in Prisma schema with:
   - `id`: Unique identifier
   - `name`: Campaign/group name
   - `userId`: Owner of the group
   - `createdAt`: Creation timestamp
   - `updatedAt`: Last update timestamp

2. **Group API Endpoints** (`/groups`):
   - `POST /groups` - Create a new group
   - `GET /groups` - Get all groups for the authenticated user
   - `GET /groups/:id` - Get a specific group with all its posts
   - `PATCH /groups/:id` - Update group name
   - `DELETE /groups/:id` - Delete a group (posts are unlinked, not deleted)

3. **Post DTOs Updated**: All post creation DTOs now include optional `groupId` field:
   - `CreateFacebookPostDto`
   - `CreateInstagramPostDto`
   - `CreateTikTokPostDto`

### Frontend

1. **Groups Service** (`src/services/groups.ts`): New service for group operations

2. **Homepage Updated**: Now displays groups (campaigns) instead of individual posts:
   - Shows group name and creation date
   - Displays post counts per platform
   - Links to group detail page

## Usage

### Creating a Group

```typescript
// Frontend
import { createGroup } from './services/groups';

const group = await createGroup({ name: 'Summer Sale Campaign 2024' });
```

### Assigning Posts to a Group

When creating a post, include the `groupId`:

```typescript
// Frontend
const post = await uploadFacebookPost({
  content: 'Check out our sale!',
  mediaUrl: 'https://example.com/image.jpg',
  groupId: group.id, // Assign to group
});
```

### Viewing Groups

The homepage now shows all groups with their post counts. Click on a group to see all posts in that campaign.

## Breaking Changes

- **Homepage**: The homepage now shows groups instead of individual posts. If you need to see individual posts, navigate to a specific group detail page.

## Notes

- Groups are optional - posts can still be created without a group
- When a group is deleted, posts are unlinked (groupId set to null) but not deleted
- All group operations require authentication

