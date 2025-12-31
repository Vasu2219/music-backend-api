# Hermon Keerthanalu - Backend Database Schema

**Target Scale**: 200-2,000 users  
**Database**: NoSQL (Firestore/MongoDB)  
**Backend**: Node.js + Express  
**Last Updated**: December 24, 2025

---

## Section 1: Core Entities (4 Collections Only)

### Why These Collections?

1. **users** - Store user profiles and authentication data
2. **songs** - Core content: songs with metadata and lyrics
3. **playlists** - Curated collections of songs
4. **user_activity** - Track likes, recently played (per user)

**What we DON'T store:**
- Play counts (use analytics service like Firebase Analytics)
- Session logs (use logging service)
- Chat/comments (not in MVP)
- Song files (use YouTube links)
- Images (use CDN URLs)

---

## Section 2: Database Schema (JSON)

### Collection 1: `users`

**Purpose**: User authentication and profile management

```json
{
  "userId": "user_abc123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://cdn.example.com/avatars/user_abc123.jpg",
  "authProvider": "google",
  "createdAt": "2025-12-24T10:30:00Z",
  "lastLoginAt": "2025-12-24T15:45:00Z",
  "fcmToken": "firebase_cloud_messaging_token_here"
}
```

**Fields Explanation:**
- `userId` - Unique identifier (from Firebase Auth or generated)
- `email` - User email (indexed)
- `displayName` - User's display name
- `photoURL` - Profile picture URL (from Google or uploaded)
- `authProvider` - "email" | "google" (for analytics)
- `createdAt` - Account creation timestamp
- `lastLoginAt` - Last login (for engagement tracking)
- `fcmToken` - For push notifications (updated on each login)

**Indexes:**
- `userId` (Primary Key)
- `email` (for login lookup)

---

### Collection 2: `songs`

**Purpose**: Store all songs with metadata and lyrics

```json
{
  "songId": "song_xyz789",
  "title": "Amazing Grace",
  "artist": "Hymn",
  "album": "Classic Hymns",
  "duration": 245,
  "thumbnailURL": "https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg",
  "youtubeURL": "https://www.youtube.com/watch?v=VIDEO_ID",
  "lyrics": "Amazing grace, how sweet the sound...\n\nFull lyrics here...",
  "language": "en",
  "category": "hymn",
  "tags": ["classic", "worship", "popular"],
  "likeCount": 847,
  "createdAt": "2025-11-15T08:00:00Z",
  "isActive": true
}
```

**Fields Explanation:**
- `songId` - Unique song identifier
- `title` - Song name
- `artist` - Artist/composer name
- `album` - Album name (optional, can be null)
- `duration` - Song length in seconds (for UI display)
- `thumbnailURL` - YouTube thumbnail (auto-generated from video ID)
- `youtubeURL` - Link to YouTube video (primary source)
- `lyrics` - Full lyrics text (searchable)
- `language` - Language code ("en", "te", "hi", etc.)
- `category` - "hymn" | "worship" | "devotional" | "trending" | "new"
- `tags` - Array for filtering (max 5 tags)
- `likeCount` - Cached count (updated via Cloud Functions)
- `createdAt` - When song was added
- `isActive` - Soft delete flag (hide from users)

**Indexes:**
- `songId` (Primary Key)
- `category` (for filtering)
- `isActive` (for active songs query)
- `createdAt` (for "new releases" sorting)
- Compound: `isActive + category + createdAt` (for efficient queries)

---

### Collection 3: `playlists`

**Purpose**: Curated song collections (admin-created or auto-generated)

```json
{
  "playlistId": "playlist_pqr456",
  "name": "Top Daily Hits",
  "description": "Most played songs today",
  "coverImageURL": "https://cdn.example.com/playlists/daily_hits.jpg",
  "songIds": ["song_xyz789", "song_abc123", "song_def456"],
  "songCount": 25,
  "type": "curated",
  "isPublic": true,
  "createdBy": "admin",
  "createdAt": "2025-12-01T00:00:00Z",
  "updatedAt": "2025-12-24T12:00:00Z",
  "order": 1
}
```

**Fields Explanation:**
- `playlistId` - Unique playlist identifier
- `name` - Playlist title
- `description` - Short description (max 200 chars)
- `coverImageURL` - Playlist cover image
- `songIds` - Array of song IDs (max 100 songs per playlist)
- `songCount` - Cached count (for UI display)
- `type` - "curated" | "auto" | "featured" (for different UI sections)
- `isPublic` - Visibility flag
- `createdBy` - "admin" or userId (for future user playlists)
- `createdAt` - Creation timestamp
- `updatedAt` - Last modification time
- `order` - Display order on home screen (lower = higher priority)

**Indexes:**
- `playlistId` (Primary Key)
- `type` (for filtering)
- `isPublic + order` (for home screen query)

**Note**: For MVP, only admin creates playlists. User playlists = future feature.

---

### Collection 4: `user_activity`

**Purpose**: Track user's likes and recently played songs

```json
{
  "activityId": "activity_user_abc123",
  "userId": "user_abc123",
  "likedSongs": [
    {
      "songId": "song_xyz789",
      "likedAt": "2025-12-24T10:15:00Z"
    },
    {
      "songId": "song_abc123",
      "likedAt": "2025-12-23T18:30:00Z"
    }
  ],
  "recentlyPlayed": [
    {
      "songId": "song_xyz789",
      "playedAt": "2025-12-24T15:45:00Z"
    },
    {
      "songId": "song_def456",
      "playedAt": "2025-12-24T14:20:00Z"
    }
  ],
  "updatedAt": "2025-12-24T15:45:00Z"
}
```

**Fields Explanation:**
- `activityId` - Unique identifier (can be same as userId)
- `userId` - Reference to user (indexed)
- `likedSongs` - Array of liked song objects (max 500)
  - Each contains `songId` and `likedAt` timestamp
  - Sorted by most recent first
- `recentlyPlayed` - Array of recently played songs (max 50)
  - Each contains `songId` and `playedAt` timestamp
  - Keep only last 50 plays
- `updatedAt` - Last activity update

**Indexes:**
- `userId` (Primary Key - one document per user)

**Why this design?**
- Single document per user = fewer reads
- Arrays are limited in size (Firestore: 1MB limit)
- Fast reads for "Liked Songs" and "Recently Played" screens
- No need for separate likes/plays collections at this scale

---

## Section 3: API Endpoints (Node.js REST)

### Base URL: `https://api.hermonkeerthanalu.com/v1`

---

### **Auth APIs**

#### 1. Register / Login
```javascript
POST /auth/register
POST /auth/login
POST /auth/google-login

Request Body:
{
  "email": "user@example.com",
  "password": "hashed_password",  // for email auth
  "googleIdToken": "token_here",   // for Google auth
  "fcmToken": "firebase_token"     // optional
}

Response (200):
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "token": "jwt_access_token"
  }
}
```

#### 2. Update FCM Token
```javascript
PUT /auth/fcm-token

Headers: Authorization: Bearer {token}
Request Body:
{
  "fcmToken": "new_firebase_token"
}

Response (200):
{ "success": true }
```

---

### **User APIs**

#### 3. Get User Profile
```javascript
GET /users/me

Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "createdAt": "2025-12-24T10:30:00Z"
  }
}
```

#### 4. Update Profile
```javascript
PUT /users/me

Headers: Authorization: Bearer {token}
Request Body:
{
  "displayName": "New Name",
  "photoURL": "https://..."
}

Response (200):
{ "success": true, "data": {...} }
```

---

### **Song APIs**

#### 5. Get All Songs (with filters)
```javascript
GET /songs?category=hymn&limit=20&offset=0

Query Params:
- category: "hymn" | "worship" | "trending" | "new" (optional)
- search: search term for title/artist/lyrics (optional)
- limit: number of results (default: 20, max: 100)
- offset: pagination offset (default: 0)

Response (200):
{
  "success": true,
  "data": [
    {
      "songId": "song_xyz789",
      "title": "Amazing Grace",
      "artist": "Hymn",
      "thumbnailURL": "https://...",
      "duration": 245,
      "likeCount": 847,
      "category": "hymn"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

#### 6. Get Single Song (with lyrics)
```javascript
GET /songs/:songId

Response (200):
{
  "success": true,
  "data": {
    "songId": "song_xyz789",
    "title": "Amazing Grace",
    "artist": "Hymn",
    "album": "Classic Hymns",
    "duration": 245,
    "thumbnailURL": "https://...",
    "youtubeURL": "https://www.youtube.com/watch?v=...",
    "lyrics": "Full lyrics here...",
    "language": "en",
    "category": "hymn",
    "tags": ["classic", "worship"],
    "likeCount": 847
  }
}
```

---

### **Playlist APIs**

#### 7. Get All Playlists
```javascript
GET /playlists

Response (200):
{
  "success": true,
  "data": [
    {
      "playlistId": "playlist_pqr456",
      "name": "Top Daily Hits",
      "description": "Most played songs today",
      "coverImageURL": "https://...",
      "songCount": 25,
      "type": "curated"
    }
  ]
}
```

#### 8. Get Playlist Details (with songs)
```javascript
GET /playlists/:playlistId

Response (200):
{
  "success": true,
  "data": {
    "playlistId": "playlist_pqr456",
    "name": "Top Daily Hits",
    "description": "Most played songs today",
    "coverImageURL": "https://...",
    "songCount": 25,
    "songs": [
      {
        "songId": "song_xyz789",
        "title": "Amazing Grace",
        "artist": "Hymn",
        "thumbnailURL": "https://...",
        "duration": 245
      }
    ]
  }
}
```

---

### **User Activity APIs**

#### 9. Like/Unlike Song
```javascript
POST /activity/like

Headers: Authorization: Bearer {token}
Request Body:
{
  "songId": "song_xyz789"
}

Response (200):
{ "success": true, "liked": true }

DELETE /activity/like/:songId
Response (200):
{ "success": true, "liked": false }
```

#### 10. Get Liked Songs
```javascript
GET /activity/liked-songs

Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "songId": "song_xyz789",
      "title": "Amazing Grace",
      "artist": "Hymn",
      "thumbnailURL": "https://...",
      "likedAt": "2025-12-24T10:15:00Z"
    }
  ]
}
```

#### 11. Track Song Play
```javascript
POST /activity/play

Headers: Authorization: Bearer {token}
Request Body:
{
  "songId": "song_xyz789"
}

Response (200):
{ "success": true }
```

#### 12. Get Recently Played
```javascript
GET /activity/recently-played

Headers: Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "songId": "song_xyz789",
      "title": "Amazing Grace",
      "artist": "Hymn",
      "thumbnailURL": "https://...",
      "playedAt": "2025-12-24T15:45:00Z"
    }
  ]
}
```

---

### **Admin APIs** (Protected)

#### 13. Add New Song
```javascript
POST /admin/songs

Headers: Authorization: Bearer {admin_token}
Request Body:
{
  "title": "New Song",
  "artist": "Artist Name",
  "youtubeURL": "https://www.youtube.com/watch?v=...",
  "lyrics": "Full lyrics...",
  "category": "hymn",
  "tags": ["worship", "popular"]
}

Response (201):
{ "success": true, "data": { "songId": "song_new123" } }
```

#### 14. Update Song
```javascript
PUT /admin/songs/:songId
DELETE /admin/songs/:songId (soft delete)
```

#### 15. Manage Playlists
```javascript
POST /admin/playlists
PUT /admin/playlists/:playlistId
DELETE /admin/playlists/:playlistId
```

---

## Section 4: Scalability Notes

### Current Design (200-2,000 users)

1. **Read Optimization**
   - Songs collection: ~500-1,000 songs max
   - Each song fetch: ~2KB (with lyrics)
   - Home screen: 1 query (playlists) + 1 query (songs) = 2 reads
   - User activity: 1 read per user (single document)

2. **Write Optimization**
   - Like/unlike: Update user_activity document (1 write)
   - Play tracking: Update user_activity document (1 write)
   - LikeCount update: Cloud Function triggers (async)

3. **Caching Strategy**
   - Cache songs list on client (refresh every 6 hours)
   - Cache playlists on client (refresh daily)
   - User activity: always fetch fresh

4. **Cost Estimation (Firestore)**
   - **Reads**: 2,000 users × 20 reads/day = 40,000 reads/day (~1.2M/month)
   - **Writes**: 2,000 users × 10 writes/day = 20,000 writes/day (~600K/month)
   - **Cost**: ~$2-5/month (well within free tier initially)

### When to Scale (Beyond 2,000 users)

**At 10,000 users:**
- Add Redis cache for songs/playlists
- Implement CDN for images
- Use Firebase Analytics for play counts

**At 50,000 users:**
- Move to PostgreSQL for relational queries
- Separate reads/writes (CQRS pattern)
- Add Elasticsearch for lyrics search

**At 100,000+ users:**
- Microservices architecture
- Message queue for async tasks
- Load balancer + multiple instances

---

## Section 5: Common Mistakes to Avoid

### ❌ DON'T Do This:

1. **Separate collection for likes**
   ```json
   // BAD: Creates 1 write per like = expensive
   likes/{likeId}: { userId, songId, likedAt }
   ```
   **Why bad?**: 1,000 likes = 1,000 documents = 1,000 reads to show "Liked Songs"

2. **Store play history in separate collection**
   ```json
   // BAD: Too many writes
   plays/{playId}: { userId, songId, playedAt }
   ```
   **Why bad?**: Every song play = 1 write. Use analytics service instead.

3. **Add fields "just in case"**
   ```json
   // BAD: Unnecessary fields
   {
     "songRating": 0,
     "downloadCount": 0,
     "shareCount": 0,
     "commentCount": 0
   }
   ```
   **Why bad?**: These features don't exist yet. Add them when needed.

4. **Store user playlists in main playlists collection**
   ```json
   // BAD: Mixes admin and user data
   playlists/{playlistId}: { createdBy: "user_xyz" }
   ```
   **Why bad?**: Query becomes complex. Keep MVP simple = admin playlists only.

5. **Normalize too much**
   ```json
   // BAD: Separate artists collection
   artists/{artistId}: { name, bio }
   songs/{songId}: { artistId: "artist_123" }
   ```
   **Why bad?**: At this scale, denormalization is faster. Artist is just a string.

6. **Store images in database**
   ```json
   // BAD: Base64 images in documents
   { "thumbnail": "data:image/png;base64,..." }
   ```
   **Why bad?**: Makes documents huge. Use CDN URLs instead.

### ✅ DO This:

1. **Use single document for user activity** (we did this ✓)
2. **Cache counts** (likeCount in songs collection) ✓
3. **Limit array sizes** (max 500 liked songs, max 50 recent plays) ✓
4. **Use compound indexes** for efficient queries ✓
5. **Soft delete** (isActive flag instead of hard delete) ✓
6. **Store URLs, not files** (thumbnailURL, photoURL) ✓

---

## Database Size Estimation

### For 2,000 users:

| Collection      | Docs      | Avg Size | Total Size |
|-----------------|-----------|----------|------------|
| users           | 2,000     | 0.5 KB   | 1 MB       |
| songs           | 1,000     | 2 KB     | 2 MB       |
| playlists       | 20        | 1 KB     | 20 KB      |
| user_activity   | 2,000     | 5 KB     | 10 MB      |
| **TOTAL**       |           |          | **~13 MB** |

**Conclusion**: This database will fit comfortably in memory and scale efficiently.

---

## Next Steps

1. **Set up Node.js + Express backend**
2. **Connect to Firestore/MongoDB**
3. **Implement JWT authentication**
4. **Create API endpoints as documented**
5. **Add Firebase Cloud Messaging for push notifications**
6. **Test with 100 users first**
7. **Monitor query performance**
8. **Add caching when needed**

---

**Remember**: Start simple. Add complexity only when you hit actual performance issues.

Good luck! 🚀
