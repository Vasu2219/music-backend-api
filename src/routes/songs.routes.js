const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', songController.getAllSongs);
router.get('/alphabet', songController.getSongsByAlphabet);
router.get('/category', songController.getSongsByCategory);

// Upload routes (must come before other routes)
router.post('/upload', authenticate, requireAdmin, upload.single('audio'), songController.uploadAudio);
router.post('/upload-thumbnail', authenticate, requireAdmin, upload.single('thumbnail'), songController.uploadThumbnail);

// YouTube routes (must come before /:id to avoid route conflicts)
router.get('/youtube/search', songController.searchYouTube);
router.get('/youtube/:videoId', songController.getYouTubeVideo);
router.put('/:songId/youtube', authenticate, requireAdmin, songController.linkYouTubeVideo);

router.get('/:id', songController.getSongById);

router.post('/', authenticate, requireAdmin, songController.createSong);
router.put('/:id', authenticate, requireAdmin, songController.updateSong);
router.delete('/:id', authenticate, requireAdmin, songController.deleteSong);

router.post('/:id/like', songController.likeSong);
router.post('/:id/share', songController.shareSong);

module.exports = router;
