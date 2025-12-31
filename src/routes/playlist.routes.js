const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const { playlistIdValidation } = require('../middleware/validation.middleware');

// @route   GET /api/v1/playlists
// @desc    Get all playlists
// @access  Public
router.get('/', playlistController.getAllPlaylists);

// @route   GET /api/v1/playlists/:playlistId
// @desc    Get playlist with songs
// @access  Public
router.get('/:playlistId', playlistIdValidation, playlistController.getPlaylistById);

module.exports = router;
