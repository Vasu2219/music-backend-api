const jwt = require('jsonwebtoken');
const { getAuth } = require('../config/firebase.config');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // First authenticate
    await authenticate(req, res, async () => {
      // Check if user is admin
      if (req.user.email === process.env.ADMIN_EMAIL) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

module.exports = { authenticate, adminAuth };
