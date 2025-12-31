const { getFirestore } = require('../config/firebase.config');

const db = getFirestore();

// Get all playlists
exports.getAllPlaylists = async (req, res, next) => {
  try {
    const snapshot = await db.collection('playlists')
      .where('isPublic', '==', true)
      .orderBy('order', 'asc')
      .get();

    const playlists = snapshot.docs.map(doc => {
      const data = doc.data();
      // Don't send full song IDs array in list view
      return {
        playlistId: data.playlistId,
        name: data.name,
        description: data.description,
        coverImageURL: data.coverImageURL,
        songCount: data.songCount,
        type: data.type
      };
    });

    res.status(200).json({
      success: true,
      data: playlists
    });
  } catch (error) {
    next(error);
  }
};

// Get playlist with full song details
exports.getPlaylistById = async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const playlistDoc = await db.collection('playlists').doc(playlistId).get();

    if (!playlistDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    const playlistData = playlistDoc.data();

    // Check if playlist is public
    if (!playlistData.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Fetch all songs in the playlist
    const songIds = playlistData.songIds || [];
    const songs = [];

    // Batch fetch songs (Firestore limitation: max 10 per 'in' query)
    for (let i = 0; i < songIds.length; i += 10) {
      const batch = songIds.slice(i, i + 10);
      const songsSnapshot = await db.collection('songs')
        .where('songId', 'in', batch)
        .where('isActive', '==', true)
        .get();

      songsSnapshot.forEach(doc => {
        const data = doc.data();
        songs.push({
          songId: data.songId,
          title: data.title,
          artist: data.artist,
          thumbnailURL: data.thumbnailURL,
          duration: data.duration
        });
      });
    }

    // Maintain order from songIds array
    const orderedSongs = songIds
      .map(id => songs.find(song => song.songId === id))
      .filter(song => song !== undefined);

    res.status(200).json({
      success: true,
      data: {
        playlistId: playlistData.playlistId,
        name: playlistData.name,
        description: playlistData.description,
        coverImageURL: playlistData.coverImageURL,
        songCount: orderedSongs.length,
        songs: orderedSongs
      }
    });
  } catch (error) {
    next(error);
  }
};
