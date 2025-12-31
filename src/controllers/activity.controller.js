const { getFirestore, admin } = require('../config/firebase.config');

const db = getFirestore();

// Like a song
exports.likeSong = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { songId } = req.body;

    const activityRef = db.collection('user_activity').doc(userId);
    const activityDoc = await activityRef.get();

    if (!activityDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User activity not found'
      });
    }

    const activityData = activityDoc.data();
    const likedSongs = activityData.likedSongs || [];

    // Check if already liked
    const alreadyLiked = likedSongs.some(item => item.songId === songId);

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'Song already liked'
      });
    }

    // Add to liked songs (at the beginning)
    const newLike = {
      songId,
      likedAt: new Date().toISOString()
    };

    // Limit to 500 liked songs
    const updatedLikedSongs = [newLike, ...likedSongs].slice(0, 500);

    await activityRef.update({
      likedSongs: updatedLikedSongs,
      updatedAt: new Date().toISOString()
    });

    // Increment like count in songs collection (async)
    db.collection('songs').doc(songId).update({
      likeCount: admin.firestore.FieldValue.increment(1)
    }).catch(err => console.error('Error updating like count:', err));

    res.status(200).json({
      success: true,
      liked: true
    });
  } catch (error) {
    next(error);
  }
};

// Unlike a song
exports.unlikeSong = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { songId } = req.params;

    const activityRef = db.collection('user_activity').doc(userId);
    const activityDoc = await activityRef.get();

    if (!activityDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User activity not found'
      });
    }

    const activityData = activityDoc.data();
    const likedSongs = activityData.likedSongs || [];

    // Remove from liked songs
    const updatedLikedSongs = likedSongs.filter(item => item.songId !== songId);

    if (likedSongs.length === updatedLikedSongs.length) {
      return res.status(400).json({
        success: false,
        message: 'Song was not liked'
      });
    }

    await activityRef.update({
      likedSongs: updatedLikedSongs,
      updatedAt: new Date().toISOString()
    });

    // Decrement like count in songs collection (async)
    db.collection('songs').doc(songId).update({
      likeCount: admin.firestore.FieldValue.increment(-1)
    }).catch(err => console.error('Error updating like count:', err));

    res.status(200).json({
      success: true,
      liked: false
    });
  } catch (error) {
    next(error);
  }
};

// Get user's liked songs
exports.getLikedSongs = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const activityDoc = await db.collection('user_activity').doc(userId).get();

    if (!activityDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User activity not found'
      });
    }

    const activityData = activityDoc.data();
    const likedSongs = activityData.likedSongs || [];

    // Fetch song details
    const songIds = likedSongs.map(item => item.songId);
    const songs = [];

    // Batch fetch songs (max 10 per 'in' query)
    for (let i = 0; i < songIds.length; i += 10) {
      const batch = songIds.slice(i, i + 10);
      if (batch.length === 0) continue;

      const songsSnapshot = await db.collection('songs')
        .where('songId', 'in', batch)
        .where('isActive', '==', true)
        .get();

      songsSnapshot.forEach(doc => songs.push(doc.data()));
    }

    // Merge with like timestamps and maintain order
    const likedSongsWithDetails = likedSongs
      .map(item => {
        const song = songs.find(s => s.songId === item.songId);
        if (!song) return null;
        return {
          songId: song.songId,
          title: song.title,
          artist: song.artist,
          thumbnailURL: song.thumbnailURL,
          likedAt: item.likedAt
        };
      })
      .filter(item => item !== null);

    res.status(200).json({
      success: true,
      data: likedSongsWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Track song play
exports.trackPlay = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { songId } = req.body;

    const activityRef = db.collection('user_activity').doc(userId);
    const activityDoc = await activityRef.get();

    if (!activityDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User activity not found'
      });
    }

    const activityData = activityDoc.data();
    const recentlyPlayed = activityData.recentlyPlayed || [];

    // Remove if already exists (to avoid duplicates)
    const filteredPlays = recentlyPlayed.filter(item => item.songId !== songId);

    // Add to recently played (at the beginning)
    const newPlay = {
      songId,
      playedAt: new Date().toISOString()
    };

    // Limit to 50 recent plays
    const updatedRecentlyPlayed = [newPlay, ...filteredPlays].slice(0, 50);

    await activityRef.update({
      recentlyPlayed: updatedRecentlyPlayed,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// Get recently played songs
exports.getRecentlyPlayed = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const activityDoc = await db.collection('user_activity').doc(userId).get();

    if (!activityDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User activity not found'
      });
    }

    const activityData = activityDoc.data();
    const recentlyPlayed = activityData.recentlyPlayed || [];

    // Fetch song details
    const songIds = recentlyPlayed.map(item => item.songId);
    const songs = [];

    // Batch fetch songs (max 10 per 'in' query)
    for (let i = 0; i < songIds.length; i += 10) {
      const batch = songIds.slice(i, i + 10);
      if (batch.length === 0) continue;

      const songsSnapshot = await db.collection('songs')
        .where('songId', 'in', batch)
        .where('isActive', '==', true)
        .get();

      songsSnapshot.forEach(doc => songs.push(doc.data()));
    }

    // Merge with play timestamps and maintain order
    const recentlyPlayedWithDetails = recentlyPlayed
      .map(item => {
        const song = songs.find(s => s.songId === item.songId);
        if (!song) return null;
        return {
          songId: song.songId,
          title: song.title,
          artist: song.artist,
          thumbnailURL: song.thumbnailURL,
          playedAt: item.playedAt
        };
      })
      .filter(item => item !== null);

    res.status(200).json({
      success: true,
      data: recentlyPlayedWithDetails
    });
  } catch (error) {
    next(error);
  }
};
