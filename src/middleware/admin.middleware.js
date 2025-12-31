/**
 * Admin Middleware
 * Verifies that the user has admin role
 */

const { isAdmin, hasPermission } = require('../utils/admin.utils');

/**
 * Middleware to check if user is admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    const adminStatus = await isAdmin(userId);
    
    if (!adminStatus) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying admin status'
    });
  }
};

/**
 * Middleware to check specific permission
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId || req.user.uid;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request'
        });
      }
      
      const hasAccess = await hasPermission(userId, permission);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Permission '${permission}' required.`
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying permission'
      });
    }
  };
};

module.exports = {
  requireAdmin,
  requirePermission
};
