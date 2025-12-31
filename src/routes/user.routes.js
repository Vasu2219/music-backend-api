const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// @route   GET /api/v1/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, userController.getProfile);

// @route   PUT /api/v1/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', authenticate, userController.updateProfile);

module.exports = router;
