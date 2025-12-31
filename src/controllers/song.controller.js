const { getFirestore } = require('../config/firebase.config');
const youtubeService = require('../services/youtube.service');
const cloudinary = require('../config/cloudinary.config');
const streamifier = require('streamifier');

const db = getFirestore();

// Get all songs with filters and pagination
exports.getAllSongs = async (req, res, next) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    // Simplified query without composite index requirement
    let query = db.collection('songs');

    // Filter by category if provided
    if (category) {
      query = query.where('category', '==', category);
    }

    // Get all active songs (no ordering to avoid index requirement)
    const snapshot = await query.get();

    let songs = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          songId: doc.id,
          title: data.title || data.titleTelugu || '',
          artist: data.artist || 'Unknown Artist',
          thumbnailURL: data.thumbnailUrl || data.thumbnailURL || null,
          youtubeURL: data.youtubeUrl || data.youtubeURL || null,
          audioUrl: data.audioUrl || null,
          cloudinaryId: data.cloudinaryId || null,
          duration: data.duration || 0,
          likeCount: data.likeCount || 0,
          category: data.category || data.categoryTelugu || 'General',
          isActive: data.isActive !== false
        };
      })
      .filter(song => song.isActive); // Client-side filter for active songs

    // Client-side search filter
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase();
      songs = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by title client-side
    songs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    // Apply pagination client-side
    const total = songs.length;
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedSongs = songs.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedSongs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get songs grouped by alphabet
exports.getSongsByAlphabet = async (req, res, next) => {
  try {
    const { letter } = req.query;
    
    let query = db.collection('songs').where('isActive', '==', true);
    
    if (letter) {
      // Filter songs starting with the specified letter
      const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
      query = query
        .where('title', '>=', letter.toUpperCase())
        .where('title', '<', nextLetter.toUpperCase())
        .orderBy('title', 'asc');
    } else {
      query = query.orderBy('title', 'asc');
    }
    
    const snapshot = await query.get();
    const songs = snapshot.docs.map(doc => ({
      songId: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      data: songs
    });
  } catch (error) {
    next(error);
  }
};

// Get songs by category
exports.getSongsByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category parameter is required'
      });
    }
    
    const snapshot = await db.collection('songs')
      .where('isActive', '==', true)
      .where('category', '==', category)
      .orderBy('createdAt', 'desc')
      .get();
    
    const songs = snapshot.docs.map(doc => ({
      songId: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      success: true,
      data: songs
    });
  } catch (error) {
    next(error);
  }
};

// Get single song with full details including lyrics
exports.getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const songDoc = await db.collection('songs').doc(id).get();

    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    const songData = songDoc.data();

    // Check if song is active
    if (!songData.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.status(200).json({
      success: true,
      data: songData
    });
  } catch (error) {
    next(error);
  }
};

// Create a new song
exports.createSong = async (req, res, next) => {
  try {
    const songData = {
      ...req.body,
      songId: req.body.songId || `song_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      likeCount: 0,
      shareCount: 0
    };
    
    await db.collection('songs').doc(songData.songId).set(songData);
    
    res.status(201).json({
      success: true,
      message: 'Song created successfully',
      data: songData
    });
  } catch (error) {
    next(error);
  }
};

// Update a song
exports.updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const songRef = db.collection('songs').doc(id);
    const songDoc = await songRef.get();
    
    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await songRef.update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Song updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete a song (soft delete)
exports.deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const songRef = db.collection('songs').doc(id);
    const songDoc = await songRef.get();
    
    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    await songRef.update({
      isActive: false,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Like a song
exports.likeSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const songRef = db.collection('songs').doc(id);
    const songDoc = await songRef.get();
    
    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    await songRef.update({
      likeCount: (songDoc.data().likeCount || 0) + 1,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Song liked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Share a song
exports.shareSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const songRef = db.collection('songs').doc(id);
    const songDoc = await songRef.get();
    
    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    await songRef.update({
      shareCount: (songDoc.data().shareCount || 0) + 1,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Song shared successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Search YouTube videos for a song
exports.searchYouTube = async (req, res, next) => {
  try {
    const { query, maxResults = 5 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const videos = await youtubeService.searchVideos(query, parseInt(maxResults));

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

// Get YouTube video details
exports.getYouTubeVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    const videoDetails = await youtubeService.getVideoDetails(videoId);

    res.status(200).json({
      success: true,
      data: videoDetails
    });
  } catch (error) {
    next(error);
  }
};

// Link YouTube video to a song
exports.linkYouTubeVideo = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({
        success: false,
        message: 'YouTube URL is required'
      });
    }

    const videoId = youtubeService.extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }

    const songRef = db.collection('songs').doc(songId);
    const songDoc = await songRef.get();

    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Get video details from YouTube
    const videoDetails = await youtubeService.getVideoDetails(videoId);

    // Update song with YouTube details
    await songRef.update({
      youtubeId: videoId,
      youtubeUrl: youtubeUrl,
      thumbnailUrl: videoDetails.thumbnail,
      duration: videoDetails.duration,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'YouTube video linked successfully',
      data: {
        songId,
        youtubeId: videoId,
        youtubeUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload audio file to Cloudinary
exports.uploadAudio = async (req, res, next) => {
  try {
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file ? 'File present' : 'No file');
    
    if (!req.file) {
      console.log('Error: No audio file provided');
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const { title, artist, category, description, youtubeUrl, lyrics } = req.body;

    if (!title || !artist || !category) {
      console.log('Error: Missing required fields', { title, artist, category });
      return res.status(400).json({
        success: false,
        message: 'Title, artist, and category are required'
      });
    }

    console.log('Starting Cloudinary upload...');
    
    // Upload to Cloudinary using stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // For audio files
          folder: 'hermon_songs',
          public_id: `song_${Date.now()}`,
          format: 'mp3'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          console.log('Cloudinary upload successful:', result.secure_url);
          resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const uploadResult = await uploadPromise;

    // Create song document in Firestore
    const songId = `song_${Date.now()}`;
    const songData = {
      id: songId,
      title,
      artist,
      category,
      description: description || '',
      youtubeUrl: youtubeUrl || null,
      youtubeURL: youtubeUrl || null,
      audioUrl: uploadResult.secure_url,
      lyrics: lyrics || '',
      thumbnailUrl: null,
      thumbnailURL: null,
      likeCount: 0,
      shareCount: 0,
      isActive: true,
      cloudinaryId: uploadResult.public_id,
      duration: uploadResult.duration || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: req.user?.userId || req.user?.uid || 'admin'
    };

    console.log('Saving to Firestore...');
    await db.collection('songs').doc(songId).set(songData);
    console.log('Song saved successfully:', songId);

    res.status(201).json({
      success: true,
      message: 'Song uploaded successfully',
      data: songData
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

// Upload thumbnail image to Cloudinary
exports.uploadThumbnail = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary using stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'hermon_thumbnails',
          public_id: `thumbnail_${Date.now()}`,
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const uploadResult = await uploadPromise;

    res.status(200).json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: {
        url: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id
      }
    });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    next(error);
  }
};

