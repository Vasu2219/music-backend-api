const express = require('express');
const router = express.Router();
const { getFirestore } = require('../config/firebase.config');

const db = getFirestore();

// @route   GET /api/v1/gallery
// @desc    Get all gallery images (public access)
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const imagesSnapshot = await db.collection('gallery_images')
      .where('isActive', '==', true)
      .orderBy('uploadedAt', 'desc')
      .get();

    const images = [];
    imagesSnapshot.forEach(doc => {
      images.push(doc.data());
    });

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
