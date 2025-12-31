const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').optional().trim().isLength({ min: 2, max: 50 }),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
];

const googleLoginValidation = [
  body('googleIdToken').notEmpty(),
  validate
];

// Song validations
const songIdValidation = [
  param('songId').notEmpty().withMessage('Song ID is required'),
  validate
];

const createSongValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('artist').trim().isLength({ min: 1, max: 100 }).withMessage('Artist is required'),
  body('youtubeURL').isURL().withMessage('Valid YouTube URL required'),
  body('lyrics').trim().isLength({ min: 10 }).withMessage('Lyrics are required'),
  body('category').isIn(['hymn', 'worship', 'devotional', 'trending', 'new']),
  body('tags').optional().isArray({ max: 5 }),
  validate
];

// Playlist validations
const playlistIdValidation = [
  param('playlistId').notEmpty().withMessage('Playlist ID is required'),
  validate
];

const createPlaylistValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('description').optional().trim().isLength({ max: 200 }),
  body('songIds').isArray({ min: 1, max: 100 }).withMessage('Provide 1-100 song IDs'),
  body('type').isIn(['curated', 'auto', 'featured']),
  validate
];

// Activity validations
const likeValidation = [
  body('songId').notEmpty().withMessage('Song ID is required'),
  validate
];

const playValidation = [
  body('songId').notEmpty().withMessage('Song ID is required'),
  validate
];

// Query validations
const paginationValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  googleLoginValidation,
  songIdValidation,
  createSongValidation,
  playlistIdValidation,
  createPlaylistValidation,
  likeValidation,
  playValidation,
  paginationValidation
};
