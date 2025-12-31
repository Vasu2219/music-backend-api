const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfzsdkdma', 
    api_key: process.env.CLOUDINARY_API_KEY || '458168338848693', 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
