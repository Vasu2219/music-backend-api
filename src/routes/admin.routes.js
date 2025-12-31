const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth } = require('../middleware/auth.middleware');
const { requireAdmin, requirePermission } = require('../middleware/admin.middleware');
const { createSongValidation, songIdValidation, createPlaylistValidation, playlistIdValidation } = require('../middleware/validation.middleware');

// ============ SONG MANAGEMENT ============

// @route   POST /api/v1/admin/songs
// @desc    Create new song
// @access  Admin only
router.post('/songs', adminAuth, createSongValidation, adminController.createSong);

// @route   PUT /api/v1/admin/songs/:songId
// @desc    Update song
// @access  Admin only
router.put('/songs/:songId', adminAuth, songIdValidation, adminController.updateSong);

// @route   DELETE /api/v1/admin/songs/:songId
// @desc    Soft delete song (set isActive = false)
// @access  Admin only
router.delete('/songs/:songId', adminAuth, songIdValidation, adminController.deleteSong);

// ============ PLAYLIST MANAGEMENT ============

// @route   POST /api/v1/admin/playlists
// @desc    Create new playlist
// @access  Admin only
router.post('/playlists', adminAuth, createPlaylistValidation, adminController.createPlaylist);

// @route   PUT /api/v1/admin/playlists/:playlistId
// @desc    Update playlist
// @access  Admin only
router.put('/playlists/:playlistId', adminAuth, playlistIdValidation, adminController.updatePlaylist);

// @route   DELETE /api/v1/admin/playlists/:playlistId
// @desc    Delete playlist
// @access  Admin only
router.delete('/playlists/:playlistId', adminAuth, playlistIdValidation, adminController.deletePlaylist);

// ============ USER MANAGEMENT ============

// @route   GET /api/v1/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/users', adminAuth, requireAdmin, adminController.getAllUsers);

// @route   GET /api/v1/admin/users/:userId
// @desc    Get user by ID
// @access  Admin only
router.get('/users/:userId', adminAuth, requireAdmin, adminController.getUserById);

// @route   PUT /api/v1/admin/users/:userId/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:userId/role', adminAuth, requireAdmin, adminController.updateUserRole);

// ============ STATISTICS ============

// @route   GET /api/v1/admin/statistics
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/statistics', adminAuth, requireAdmin, adminController.getStatistics);

// ============ ACTIVITIES ============

// @route   GET /api/v1/admin/activities
// @desc    Get all user activities
// @access  Admin only
router.get('/activities', adminAuth, requireAdmin, adminController.getAllActivities);

module.exports = router;
