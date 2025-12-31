const express = require('express');
const router = express.Router();
const userActivityController = require('../controllers/user-activity.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Track song play
router.post('/play', authenticate, userActivityController.trackSongPlay);

// Get user's top played songs
router.get('/top-played', authenticate, userActivityController.getTopPlayedSongs);

// Get recently played songs
router.get('/recently-played', authenticate, userActivityController.getRecentlyPlayed);

module.exports = router;
