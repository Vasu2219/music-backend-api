const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (files stored in memory before uploading to Cloudinary)
const storage = multer.memoryStorage();

// File filter to allow only audio files and images
const fileFilter = (req, file, cb) => {
    const allowedAudioTypes = /mp3|wav|m4a|aac|ogg|flac/;
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    
    const extname = path.extname(file.originalname).toLowerCase().substring(1);
    const mimetype = file.mimetype;
    
    // Check if it's an audio file
    if (allowedAudioTypes.test(extname) || mimetype.startsWith('audio/')) {
        return cb(null, true);
    }
    
    // Check if it's an image file
    if (allowedImageTypes.test(extname) || mimetype.startsWith('image/')) {
        return cb(null, true);
    }
    
    cb(new Error('Only audio files (mp3, wav, m4a, aac, ogg, flac) and images (jpeg, jpg, png, gif, webp) are allowed!'));
};

// Create multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    fileFilter: fileFilter
});

module.exports = upload;
