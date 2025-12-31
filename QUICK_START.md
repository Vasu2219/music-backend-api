# 🚀 Hermon Keerthanalu Backend - Quick Setup Guide

Follow these steps to get your backend up and running in **5 minutes**.

---

## ✅ Step 1: Prerequisites Check

Make sure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Firebase account (free tier is fine)

---

## ✅ Step 2: Firebase Setup (2 minutes)

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter project name: `hermon-keerthanalu`
4. Disable Google Analytics (optional for MVP)
5. Click **"Create Project"**

### 2.2 Enable Firestore

1. In Firebase Console, click **"Firestore Database"** (left sidebar)
2. Click **"Create Database"**
3. Select **"Start in production mode"**
4. Choose location: `us-central1` (or nearest to your users)
5. Click **"Enable"**

### 2.3 Get Service Account Key

1. Click ⚙️ (Settings) > **"Project Settings"**
2. Go to **"Service Accounts"** tab
3. Click **"Generate New Private Key"**
4. Download JSON file
5. Rename it to `serviceAccountKey.json`
6. **Move it to `backend-api/` folder**

⚠️ **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` (already done)

---

## ✅ Step 3: Install Dependencies (1 minute)

```bash
cd backend-api
npm install
```

This installs:
- Express (web framework)
- Firebase Admin SDK
- JWT (authentication)
- Validation & security packages

---

## ✅ Step 4: Configure Environment (1 minute)

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set these values:

```env
PORT=3000
NODE_ENV=development

# IMPORTANT: Change this to a random string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Your admin email (for creating songs/playlists)
ADMIN_EMAIL=your-email@gmail.com

# Optional: CORS origins (for production)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Step 5: Start Server (10 seconds)

```bash
npm run dev
```

You should see:
```
✅ Firebase initialized successfully
🚀 Server running on port 3000
📝 Environment: development
🔗 API Base URL: http://localhost:3000/api/v1
```

---

## ✅ Step 6: Test Your API (1 minute)

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-24T..."
}
```

### Test 2: Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "test@example.com",
    "displayName": "Test User",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

✅ **Success!** Your backend is running!

---

## 🎯 Next Steps

### 1. Add Your First Song (Admin)

First, register with your admin email:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "password": "admin123",
    "displayName": "Admin"
  }'
```

Copy the `token` from the response, then add a song:

```bash
curl -X POST http://localhost:3000/api/v1/admin/songs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Grace",
    "artist": "Traditional Hymn",
    "youtubeURL": "https://www.youtube.com/watch?v=CDdvReNKKuk",
    "lyrics": "Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now I am found\nWas blind, but now I see",
    "category": "hymn",
    "tags": ["classic", "worship", "traditional"]
  }'
```

### 2. Create Your First Playlist

```bash
curl -X POST http://localhost:3000/api/v1/admin/playlists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic Hymns",
    "description": "Traditional worship songs",
    "songIds": ["SONG_ID_FROM_STEP_1"],
    "type": "curated",
    "isPublic": true,
    "order": 1
  }'
```

### 3. Use Postman Collection

Import `postman_collection.json` into Postman for easy testing of all endpoints.

### 4. Connect Android App

Update your Android app's API base URL to:
```
http://YOUR_IP:3000/api/v1
```

Or deploy to production (see deployment guide below).

---

## 📦 Deployment (Optional)

### Quick Deploy to Render.com (Free Tier)

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Click **"New +" → "Web Service"**
4. Connect your GitHub repo
5. Set environment variables (JWT_SECRET, ADMIN_EMAIL)
6. Deploy!

Your API will be live at: `https://your-app.onrender.com/api/v1`

---

## 🐛 Troubleshooting

### Error: "Firestore not initialized"
- Make sure `serviceAccountKey.json` is in `backend-api/` folder
- Check file permissions

### Error: "Invalid token"
- JWT token expired (7 days). Login again to get a new token
- Make sure JWT_SECRET in `.env` matches

### Error: "Admin access required"
- Make sure you registered with the email in `ADMIN_EMAIL`
- Check that email matches exactly

### Port 3000 already in use
- Change `PORT=3001` in `.env`
- Or kill the process: `npx kill-port 3000`

---

## 📚 Learn More

- Full documentation: [README.md](./README.md)
- Database schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- API testing: Use `postman_collection.json`

---

## ✨ You're Ready!

Your backend is now:
- ✅ Running locally
- ✅ Connected to Firestore
- ✅ Accepting API requests
- ✅ Ready for your Android app

**Happy coding! 🎵**
