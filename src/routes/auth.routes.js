const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidation, loginValidation, googleLoginValidation } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

// @route   POST /api/v1/auth/register
// @desc    Register new user with email/password
// @access  Public
router.post('/register', registerValidation, authController.register);

// @route   POST /api/v1/auth/login
// @desc    Login user with email/password
// @access  Public
router.post('/login', loginValidation, authController.login);

// @route   POST /api/v1/auth/google-login
// @desc    Login user with Google
// @access  Public
router.post('/google-login', googleLoginValidation, authController.googleLogin);

// @route   POST /api/v1/auth/google
// @desc    Login/Register user with Google (alias for mobile)
// @access  Public
router.post('/google', googleLoginValidation, authController.googleLogin);

// @route   POST /api/v1/auth/phone/verify
// @desc    Verify phone number
// @access  Public
router.post('/phone/verify', authController.verifyPhone);

// @route   POST /api/v1/auth/password/reset
// @desc    Reset password
// @access  Public
router.post('/password/reset', authController.resetPassword);

// @route   GET /api/v1/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, authController.getProfile);

// @route   PUT /api/v1/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, authController.updateProfile);

// @route   PUT /api/v1/auth/fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
router.put('/fcm-token', authenticate, authController.updateFcmToken);

module.exports = router;
