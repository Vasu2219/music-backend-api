# Hermon Keerthanalu Backend API

A clean, scalable Node.js REST API for the Hermon Keerthanalu music + lyrics mobile application.

## 🎯 Overview

- **Target Scale**: 200-2,000 users
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: JWT + Firebase Auth (Email & Google)
- **Tech Stack**: Node.js, Express, Firebase Admin SDK
- **API Version**: v1

## 📁 Project Structure

```
backend-api/
├── src/
│   ├── config/
│   │   └── firebase.config.js       # Firebase initialization
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication logic
│   │   ├── user.controller.js       # User profile management
│   │   ├── song.controller.js       # Song browsing & retrieval
│   │   ├── playlist.controller.js   # Playlist management
│   │   ├── activity.controller.js   # Like/play tracking
│   │   └── admin.controller.js      # Admin operations
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── error.middleware.js      # Error handling
│   │   └── validation.middleware.js # Input validation
│   ├── routes/
│   │   ├── auth.routes.js          # /auth endpoints
│   │   ├── user.routes.js          # /users endpoints
│   │   ├── song.routes.js          # /songs endpoints
│   │   ├── playlist.routes.js      # /playlists endpoints
│   │   ├── activity.routes.js      # /activity endpoints
│   │   └── admin.routes.js         # /admin endpoints
│   └── server.js                    # Express app entry point
├── .env.example                     # Environment variables template
├── .gitignore
├── package.json
├── DATABASE_SCHEMA.md               # Complete database documentation
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase project with Firestore enabled
- Firebase Admin SDK service account key

### Installation

1. **Clone & Install**
   ```bash
   cd backend-api
   npm install
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Go to Project Settings > Service Accounts
   - Generate a new private key (JSON file)
   - Save it as `serviceAccountKey.json` in the `backend-api` folder

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your values:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-key-here
   ADMIN_EMAIL=admin@hermonkeerthanalu.com
   ```

4. **Start Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify Server**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{ "success": true, "message": "Server is running" }`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All protected routes require a JWT token in the header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Auth** | | | |
| POST | `/auth/register` | Register with email/password | Public |
| POST | `/auth/login` | Login with email/password | Public |
| POST | `/auth/google-login` | Login with Google | Public |
| PUT | `/auth/fcm-token` | Update FCM token | Private |
| **Users** | | | |
| GET | `/users/me` | Get current user profile | Private |
| PUT | `/users/me` | Update user profile | Private |
| **Songs** | | | |
| GET | `/songs` | Get all songs (with filters) | Public |
| GET | `/songs/:songId` | Get song details + lyrics | Public |
| **Playlists** | | | |
| GET | `/playlists` | Get all playlists | Public |
| GET | `/playlists/:playlistId` | Get playlist with songs | Public |
| **Activity** | | | |
| POST | `/activity/like` | Like a song | Private |
| DELETE | `/activity/like/:songId` | Unlike a song | Private |
| GET | `/activity/liked-songs` | Get user's liked songs | Private |
| POST | `/activity/play` | Track song play | Private |
| GET | `/activity/recently-played` | Get recently played | Private |
| **Admin** | | | |
| POST | `/admin/songs` | Create new song | Admin |
| PUT | `/admin/songs/:songId` | Update song | Admin |
| DELETE | `/admin/songs/:songId` | Delete song | Admin |
| POST | `/admin/playlists` | Create playlist | Admin |
| PUT | `/admin/playlists/:playlistId` | Update playlist | Admin |
| DELETE | `/admin/playlists/:playlistId` | Delete playlist | Admin |

### Example Requests

**Register User**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe"
  }'
```

**Get All Songs**
```bash
curl http://localhost:3000/api/v1/songs?category=hymn&limit=20
```

**Like a Song**
```bash
curl -X POST http://localhost:3000/api/v1/activity/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "songId": "song_xyz789" }'
```

## 🗄️ Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete documentation including:
- 4 core collections (users, songs, playlists, user_activity)
- Sample JSON documents
- Indexing strategy
- Scalability notes
- Common mistakes to avoid

## 🔐 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **JWT Authentication**: 7-day expiration
- **Input Validation**: Express-validator middleware
- **Password Hashing**: bcryptjs with salt rounds
- **Admin Protection**: Separate admin middleware

## 📊 Performance

### Expected Load (2,000 users)

- **API Requests**: ~100,000/day
- **Database Reads**: ~1.2M/month
- **Database Writes**: ~600K/month
- **Firestore Cost**: ~$2-5/month (within free tier)

### Optimization Strategies

1. **Client-side caching**: Cache songs/playlists for 6 hours
2. **Array-based storage**: Single document per user for likes/plays
3. **Lazy loading**: Don't send full lyrics in list views
4. **Batch queries**: Fetch multiple songs in single request
5. **Async operations**: Like count updates don't block responses

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Lint code
npm run lint
```

## 🚀 Deployment

### Option 1: Google Cloud Run (Recommended)

1. **Build Docker image**
   ```bash
   docker build -t hermon-api .
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy hermon-api \
     --image gcr.io/YOUR_PROJECT/hermon-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 2: Heroku

1. **Create Heroku app**
   ```bash
   heroku create hermon-api
   ```

2. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FIREBASE_PROJECT_ID=your-project
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Traditional VPS (DigitalOcean, AWS EC2)

1. **Install Node.js on server**
2. **Clone repository**
3. **Install dependencies**: `npm install --production`
4. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name hermon-api
   pm2 startup
   pm2 save
   ```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes* | - |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes* | - |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes* | - |
| `ADMIN_EMAIL` | Admin user email | Yes | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | * |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

\* Can use `serviceAccountKey.json` file instead

## 📝 Admin Operations

To add songs and playlists, you need admin access:

1. **Set admin email** in `.env`:
   ```env
   ADMIN_EMAIL=your-admin@email.com
   ```

2. **Register with that email**

3. **Use admin endpoints** with your JWT token

**Example: Add a Song**
```bash
curl -X POST http://localhost:3000/api/v1/admin/songs \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Grace",
    "artist": "Hymn",
    "youtubeURL": "https://www.youtube.com/watch?v=VIDEO_ID",
    "lyrics": "Amazing grace, how sweet the sound...",
    "category": "hymn",
    "tags": ["classic", "worship"]
  }'
```

## 🐛 Troubleshooting

### Firebase Connection Issues
```
Error: Firestore not initialized
```
**Solution**: Make sure `serviceAccountKey.json` exists or environment variables are set correctly.

### JWT Token Errors
```
Error: Invalid or expired token
```
**Solution**: Token may have expired. Login again to get a new token.

### Rate Limit Exceeded
```
Error: Too many requests
```
**Solution**: Wait 15 minutes or increase `RATE_LIMIT_MAX_REQUESTS` in `.env`.

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Check Logs
```bash
# Development
npm run dev

# Production (PM2)
pm2 logs hermon-api
```

### Firebase Console
- Monitor Firestore usage: [Firebase Console](https://console.firebase.google.com/)
- Check read/write operations
- View database size

## 🔄 Future Enhancements

When you reach 5,000+ users, consider:

1. **Redis caching** for songs/playlists
2. **CDN** for images (Cloudflare, CloudFront)
3. **Elasticsearch** for advanced lyrics search
4. **Message queue** (RabbitMQ, SQS) for async tasks
5. **Microservices** architecture
6. **PostgreSQL** for complex queries

## 📞 Support

For issues or questions:
- Check [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for design decisions
- Review error logs in console
- Verify Firebase configuration

## 📄 License

ISC

---

**Built with ❤️ for Hermon Keerthanalu**

*Simple, scalable, production-ready backend for your music app.*
