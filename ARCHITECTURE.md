# 🏗️ Hermon Keerthanalu Backend - System Architecture

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ANDROID APP (Client)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login     │  │  Song List   │  │  Now Playing │      │
│  │   Screen    │  │   Screen     │  │    Screen    │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP REST API
                            │ JWT Authentication
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               NODE.JS BACKEND (Express Server)               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API Layer (v1)                     │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │  │
│  │  │ Auth │ │ Songs│ │ Play │ │ User │ │Admin│       │  │
│  │  │ /auth│ │/songs│ │/list │ │/users│ │/admin│      │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │                  Middleware Layer                     │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │  │
│  │  │     JWT     │ │ Validation  │ │    Rate     │   │  │
│  │  │    Auth     │ │   Rules     │ │   Limiter   │   │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │                Controller Layer                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │   Auth   │ │   Song   │ │ Activity │ │ Admin  │ │  │
│  │  │Controller│ │Controller│ │Controller│ │Controller│ │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  └─────────────────────┬────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │ Firebase Admin SDK
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE FIRESTORE (Database)                   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    users     │  │    songs     │  │  playlists   │     │
│  │              │  │              │  │              │     │
│  │ • userId     │  │ • songId     │  │ • playlistId │     │
│  │ • email      │  │ • title      │  │ • name       │     │
│  │ • name       │  │ • artist     │  │ • songIds[]  │     │
│  │ • fcmToken   │  │ • lyrics     │  │ • order      │     │
│  └──────────────┘  │ • youtubeURL │  └──────────────┘     │
│                     │ • category   │                        │
│  ┌──────────────┐  │ • likeCount  │                        │
│  │user_activity │  └──────────────┘                        │
│  │              │                                            │
│  │ • userId     │                                            │
│  │ • likedSongs[]                                           │
│  │ • recentlyPlayed[]                                       │
│  └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Diagram

### Example: User Likes a Song

```
┌─────────┐
│ Android │
│   App   │
└────┬────┘
     │ 1. POST /api/v1/activity/like
     │    Headers: Authorization: Bearer token
     │    Body: { songId: "song_xyz" }
     ▼
┌─────────────┐
│   Express   │
│   Server    │
└────┬────────┘
     │ 2. Check JWT token (auth.middleware.js)
     ▼
┌──────────────┐
│ Authenticate │  ✅ Valid token?
│  Middleware  │
└────┬─────────┘
     │ 3. Validate input (validation.middleware.js)
     ▼
┌──────────────┐
│  Validation  │  ✅ Valid songId?
│  Middleware  │
└────┬─────────┘
     │ 4. Execute controller (activity.controller.js)
     ▼
┌──────────────┐
│   Activity   │  • Get user_activity document
│  Controller  │  • Add to likedSongs array
│              │  • Update timestamp
└────┬─────────┘  • Increment song.likeCount (async)
     │ 5. Write to Firestore
     ▼
┌──────────────┐
│  Firestore   │  ✅ Document updated
│   Database   │
└────┬─────────┘
     │ 6. Return response
     ▼
┌─────────────┐
│   Express   │  { success: true, liked: true }
│   Server    │
└────┬────────┘
     │ 7. Response to client
     ▼
┌─────────┐
│ Android │  ✅ Update UI (heart icon filled)
│   App   │
└─────────┘
```

## 🗂️ Database Structure

### Collection Relationships

```
users (2,000 docs)
  └─ userId [Primary Key]
      ├─ email [Indexed]
      ├─ displayName
      ├─ photoURL
      ├─ authProvider
      └─ fcmToken

songs (1,000 docs)
  └─ songId [Primary Key]
      ├─ title
      ├─ artist
      ├─ lyrics (full text)
      ├─ youtubeURL
      ├─ category [Indexed]
      ├─ isActive [Indexed]
      └─ likeCount (cached)

playlists (20 docs)
  └─ playlistId [Primary Key]
      ├─ name
      ├─ description
      ├─ songIds[] (array of song IDs)
      ├─ isPublic [Indexed]
      └─ order [Indexed]

user_activity (2,000 docs - one per user)
  └─ userId [Primary Key = activityId]
      ├─ likedSongs[]
      │   └─ { songId, likedAt }
      └─ recentlyPlayed[]
          └─ { songId, playedAt }
```

### Why This Structure?

✅ **Single document per user activity** = Fast reads
✅ **Denormalized likeCount** = No need to count each time
✅ **Arrays for lists** = Perfect for small datasets
✅ **No joins needed** = Simple queries
✅ **Optimized for reads** = Mobile apps read more than write

## 📡 API Endpoint Grouping

### Public Endpoints (No Auth Required)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/google-login
GET    /api/v1/songs
GET    /api/v1/songs/:songId
GET    /api/v1/playlists
GET    /api/v1/playlists/:playlistId
```

### Private Endpoints (JWT Required)
```
PUT    /api/v1/auth/fcm-token
GET    /api/v1/users/me
PUT    /api/v1/users/me
POST   /api/v1/activity/like
DELETE /api/v1/activity/like/:songId
GET    /api/v1/activity/liked-songs
POST   /api/v1/activity/play
GET    /api/v1/activity/recently-played
```

### Admin Endpoints (Admin JWT Required)
```
POST   /api/v1/admin/songs
PUT    /api/v1/admin/songs/:songId
DELETE /api/v1/admin/songs/:songId
POST   /api/v1/admin/playlists
PUT    /api/v1/admin/playlists/:playlistId
DELETE /api/v1/admin/playlists/:playlistId
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│         Layer 1: Network Security       │
│  • HTTPS (TLS/SSL)                      │
│  • CORS (Allowed Origins)               │
│  • Rate Limiting (100 req/15min)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Layer 2: Application Security      │
│  • Helmet.js (Security Headers)         │
│  • Input Validation (express-validator) │
│  • SQL Injection Prevention (Firestore) │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Layer 3: Authentication Layer      │
│  • JWT Tokens (7-day expiration)        │
│  • Password Hashing (bcrypt, 10 rounds)│
│  • Google OAuth (Firebase Auth)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Layer 4: Authorization Layer       │
│  • User vs Admin separation             │
│  • Resource ownership checks            │
│  • Admin email whitelist                │
└─────────────────────────────────────────┘
```

## 📊 Data Flow Examples

### 1. User Registration Flow
```
Mobile App → POST /auth/register
         ↓
    Validate input
         ↓
    Hash password (bcrypt)
         ↓
    Create user doc in Firestore
         ↓
    Create empty user_activity doc
         ↓
    Generate JWT token
         ↓
    Return { userId, token, ... }
```

### 2. Browse Songs Flow
```
Mobile App → GET /songs?category=hymn&limit=20
         ↓
    Query Firestore:
    - WHERE isActive = true
    - WHERE category = "hymn"
    - ORDER BY createdAt DESC
    - LIMIT 20
         ↓
    Return song list (without full lyrics)
```

### 3. Like Song Flow
```
Mobile App → POST /activity/like { songId }
         ↓
    Verify JWT token
         ↓
    Get user_activity document
         ↓
    Add { songId, likedAt } to likedSongs[]
         ↓
    Async: Increment songs.likeCount
         ↓
    Return { success: true }
```

## 🔄 Scalability Path

### Current (200-2,000 users)
```
┌──────────────┐
│  Single      │
│  Express     │  → Firebase Firestore
│  Instance    │     (Read-optimized)
└──────────────┘
```

### Phase 2 (5,000-10,000 users)
```
┌──────────────┐     ┌──────────────┐
│  Express     │ ──→ │    Redis     │
│  Instance    │     │    Cache     │
└──────┬───────┘     └──────────────┘
       │
       └──────────→ Firebase Firestore
```

### Phase 3 (50,000+ users)
```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴────┬────────┐
   │        │        │
┌──▼───┐ ┌─▼────┐ ┌─▼────┐
│Server│ │Server│ │Server│
└──┬───┘ └─┬────┘ └─┬────┘
   │       │        │
   └───┬───┴────┬───┘
       │        │
    ┌──▼────┐ ┌▼────────┐
    │ Redis │ │PostgreSQL│
    │ Cache │ │ Database │
    └───────┘ └──────────┘
```

## 📈 Performance Metrics

### Expected Response Times
```
Health Check        : 10-20ms
Login/Register      : 200-300ms (includes Firebase auth)
Get Songs List      : 100-150ms
Get Single Song     : 80-120ms
Like Song           : 150-200ms
Get Playlists       : 100-150ms
```

### Database Operations Cost
```
For 2,000 active users per month:

┌─────────────┬──────────┬──────────┐
│ Operation   │  Count   │   Cost   │
├─────────────┼──────────┼──────────┤
│ Reads       │  1.2M    │  $0.36   │
│ Writes      │  600K    │  $0.54   │
│ Storage     │  13 MB   │  $0.00   │
│ Total       │          │  $0.90   │
└─────────────┴──────────┴──────────┘

FREE TIER COVERS: 50K reads + 20K writes per DAY
Your app will likely stay FREE for months!
```

## 🎯 Design Decisions Summary

| Decision | Reason |
|----------|--------|
| **NoSQL (Firestore)** | Fast reads, easy scaling, Firebase ecosystem |
| **Single user_activity doc** | Fewer reads, better performance for likes/plays |
| **Cached likeCount** | Avoid counting on every query |
| **JWT tokens** | Stateless, mobile-friendly, 7-day validity |
| **Array for lists** | Perfect for small datasets (<500 items) |
| **Denormalized data** | Faster reads, acceptable at this scale |
| **Soft delete** | Keep data, easy recovery |
| **No microservices** | Unnecessary complexity for this scale |

## 📂 File Organization Logic

```
src/
├── config/          Configuration files (Firebase, etc.)
├── controllers/     Business logic (what to do)
├── middleware/      Request processing (validation, auth)
├── routes/          URL mapping (which endpoint to where)
└── server.js        Application entry point

scripts/            Utility scripts (seeding, migrations)
docs/               Documentation files
tests/              Test files (future)
```

## 🔧 Technology Choices Explained

| Technology | Why Chosen | Alternative |
|------------|------------|-------------|
| **Node.js** | Fast, JavaScript everywhere | Python/Django, Go |
| **Express** | Simple, mature, widely used | Fastify, Koa |
| **Firestore** | Firebase ecosystem, real-time | MongoDB, PostgreSQL |
| **JWT** | Stateless, mobile-friendly | Sessions, OAuth2 |
| **bcrypt** | Industry standard for passwords | Argon2, Scrypt |

---

**This architecture is built for:**
- ✅ Fast development
- ✅ Easy maintenance
- ✅ Low cost (<$5/month)
- ✅ Good performance
- ✅ Future scalability

**Not over-engineered. Just right for 200-2,000 users.** 🎯
