const { getFirestore } = require('../config/firebase.config');
const { v4: uuidv4 } = require('uuid');

const db = getFirestore();

// ============ SONG MANAGEMENT ============

// Create new song
exports.createSong = async (req, res, next) => {
  try {
    const { title, artist, album, duration, youtubeURL, lyrics, language, category, tags } = req.body;

    // Extract YouTube video ID
    const videoIdMatch = youtubeURL.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }

    const songId = `song_${uuidv4()}`;
    const now = new Date().toISOString();

    const songData = {
      songId,
      title: title.trim(),
      artist: artist.trim(),
      album: album?.trim() || null,
      duration: duration || 0,
      thumbnailURL: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      youtubeURL,
      lyrics: lyrics.trim(),
      language: language || 'en',
      category,
      tags: tags || [],
      likeCount: 0,
      createdAt: now,
      isActive: true
    };

    await db.collection('songs').doc(songId).set(songData);

    res.status(201).json({
      success: true,
      data: { songId }
    });
  } catch (error) {
    next(error);
  }
};

// Update song
exports.updateSong = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.songId;
    delete updates.likeCount;
    delete updates.createdAt;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // If YouTube URL is updated, update thumbnail too
    if (updates.youtubeURL) {
      const videoIdMatch = updates.youtubeURL.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      if (videoId) {
        updates.thumbnailURL = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    const songRef = db.collection('songs').doc(songId);
    const songDoc = await songRef.get();

    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    await songRef.update(updates);

    res.status(200).json({
      success: true,
      message: 'Song updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete song
exports.deleteSong = async (req, res, next) => {
  try {
    const { songId } = req.params;

    const songRef = db.collection('songs').doc(songId);
    const songDoc = await songRef.get();

    if (!songDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Soft delete: set isActive = false
    await songRef.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============ PLAYLIST MANAGEMENT ============

// Create new playlist
exports.createPlaylist = async (req, res, next) => {
  try {
    const { name, description, coverImageURL, songIds, type, isPublic, order } = req.body;

    const playlistId = `playlist_${uuidv4()}`;
    const now = new Date().toISOString();

    const playlistData = {
      playlistId,
      name: name.trim(),
      description: description?.trim() || '',
      coverImageURL: coverImageURL || 'https://via.placeholder.com/400x400?text=Playlist',
      songIds: songIds || [],
      songCount: songIds?.length || 0,
      type: type || 'curated',
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: 'admin',
      createdAt: now,
      updatedAt: now,
      order: order || 999
    };

    await db.collection('playlists').doc(playlistId).set(playlistData);

    res.status(201).json({
      success: true,
      data: { playlistId }
    });
  } catch (error) {
    next(error);
  }
};

// Update playlist
exports.updatePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.playlistId;
    delete updates.createdBy;
    delete updates.createdAt;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Update songCount if songIds is updated
    if (updates.songIds) {
      updates.songCount = updates.songIds.length;
    }

    updates.updatedAt = new Date().toISOString();

    const playlistRef = db.collection('playlists').doc(playlistId);
    const playlistDoc = await playlistRef.get();

    if (!playlistDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    await playlistRef.update(updates);

    res.status(200).json({
      success: true,
      message: 'Playlist updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete playlist
exports.deletePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const playlistRef = db.collection('playlists').doc(playlistId);
    const playlistDoc = await playlistRef.get();

    if (!playlistDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    await playlistRef.delete();

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============ USER MANAGEMENT ============

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt
      });
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userDoc.data()
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await userRef.update({ 
      role,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============ STATISTICS ============

// Get dashboard statistics
exports.getStatistics = async (req, res, next) => {
  try {
    // Get counts from all collections
    const songsSnapshot = await db.collection('songs').where('isActive', '==', true).get();
    const usersSnapshot = await db.collection('users').get();
    const playlistsSnapshot = await db.collection('playlists').get();
    const activitiesSnapshot = await db.collection('activities').get();

    const statistics = {
      totalSongs: songsSnapshot.size,
      totalUsers: usersSnapshot.size,
      totalPlaylists: playlistsSnapshot.size,
      totalActivities: activitiesSnapshot.size
    };

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

// ============ ACTIVITIES ============

// Get all activities
exports.getAllActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const activitiesSnapshot = await db.collection('activities')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const activities = [];
    activitiesSnapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

