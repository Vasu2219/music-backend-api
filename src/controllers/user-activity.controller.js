const { getFirestore } = require('../config/firebase.config');

class UserActivityController {
  async trackSongPlay(req, res) {
    try {
      const { songId } = req.body;
      const userId = req.user.userId;
      
      if (!songId) {
        return res.status(400).json({ error: 'Song ID is required' });
      }

      const db = getFirestore();
      
      // Create activity record
      const activityRef = db.collection('userActivity').doc();
      await activityRef.set({
        userId,
        songId,
        activityType: 'play',
        timestamp: new Date().toISOString()
      });

      // Update play count in song document
      const songRef = db.collection('songs').doc(songId);
      await songRef.update({
        playCount: require('firebase-admin').firestore.FieldValue.increment(1)
      });

      res.json({ success: true, message: 'Play tracked' });
    } catch (error) {
      console.error('Track play error:', error);
      res.status(500).json({ error: 'Failed to track play' });
    }
  }

  async getTopPlayedSongs(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 5;
      
      const db = getFirestore();
      
      // Get user's play history
      const activitiesSnapshot = await db.collection('userActivity')
        .where('userId', '==', userId)
        .where('activityType', '==', 'play')
        .get();

      // Count plays per song
      const songPlayCounts = {};
      activitiesSnapshot.docs.forEach(doc => {
        const songId = doc.data().songId;
        songPlayCounts[songId] = (songPlayCounts[songId] || 0) + 1;
      });

      // Sort by play count and get top songs
      const topSongIds = Object.entries(songPlayCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(entry => entry[0]);

      if (topSongIds.length === 0) {
        return res.json({ songs: [] });
      }

      // Fetch song details
      const songs = [];
      for (const songId of topSongIds) {
        const songDoc = await db.collection('songs').doc(songId).get();
        if (songDoc.exists) {
          songs.push({
            ...songDoc.data(),
            songId: songDoc.id,
            playCount: songPlayCounts[songId]
          });
        }
      }

      res.json({ songs });
    } catch (error) {
      console.error('Get top played songs error:', error);
      res.status(500).json({ error: 'Failed to get top played songs' });
    }
  }

  async getRecentlyPlayed(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 10;
      
      const db = getFirestore();
      
      const activitiesSnapshot = await db.collection('userActivity')
        .where('userId', '==', userId)
        .where('activityType', '==', 'play')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const songIds = [...new Set(activitiesSnapshot.docs.map(doc => doc.data().songId))];
      
      if (songIds.length === 0) {
        return res.json({ songs: [] });
      }

      const songs = [];
      for (const songId of songIds) {
        const songDoc = await db.collection('songs').doc(songId).get();
        if (songDoc.exists) {
          songs.push({
            ...songDoc.data(),
            songId: songDoc.id
          });
        }
      }

      res.json({ songs });
    } catch (error) {
      console.error('Get recently played error:', error);
      res.status(500).json({ error: 'Failed to get recently played songs' });
    }
  }
}

module.exports = new UserActivityController();
