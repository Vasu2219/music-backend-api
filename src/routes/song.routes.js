const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const { songIdValidation, paginationValidation } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// @route   GET /api/v1/songs
// @desc    Get all songs with optional filters
// @access  Public
router.get('/', paginationValidation, songController.getAllSongs);

// @route   POST /api/v1/songs/upload
// @desc    Upload audio file to Cloudinary and create song
// @access  Protected (Admin)
router.post('/upload', authMiddleware, adminMiddleware, upload.single('audio'), songController.uploadAudio);

// @route   POST /api/v1/songs/upload-thumbnail
// @desc    Upload thumbnail image to Cloudinary
// @access  Protected (Admin)
router.post('/upload-thumbnail', authMiddleware, adminMiddleware, upload.single('thumbnail'), songController.uploadThumbnail);

// @route   GET /api/v1/songs/youtube/search
// @desc    Search YouTube videos
// @access  Public
router.get('/youtube/search', songController.searchYouTube);

// @route   GET /api/v1/songs/youtube/:videoId
// @desc    Get YouTube video details
// @access  Public
router.get('/youtube/:videoId', songController.getYouTubeVideo);

// @route   PUT /api/v1/songs/:songId/youtube
// @desc    Link YouTube video to a song
// @access  Protected (Admin)
router.put('/:songId/youtube', songController.linkYouTubeVideo);

// @route   GET /api/v1/songs/:songId
// @desc    Get single song with lyrics
// @access  Public
router.get('/:songId', songIdValidation, songController.getSongById);

module.exports = router;
