const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { likeValidation, playValidation, songIdValidation } = require('../middleware/validation.middleware');

// @route   POST /api/v1/activity/like
// @desc    Like a song
// @access  Private
router.post('/like', authenticate, likeValidation, activityController.likeSong);

// @route   DELETE /api/v1/activity/like/:songId
// @desc    Unlike a song
// @access  Private
router.delete('/like/:songId', authenticate, songIdValidation, activityController.unlikeSong);

// @route   GET /api/v1/activity/liked-songs
// @desc    Get user's liked songs
// @access  Private
router.get('/liked-songs', authenticate, activityController.getLikedSongs);

// @route   POST /api/v1/activity/play
// @desc    Track song play
// @access  Private
router.post('/play', authenticate, playValidation, activityController.trackPlay);

// @route   GET /api/v1/activity/recently-played
// @desc    Get recently played songs
// @access  Private
router.get('/recently-played', authenticate, activityController.getRecentlyPlayed);

module.exports = router;
