const { getFirestore } = require('../config/firebase.config');

const db = getFirestore();

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    delete userData.passwordHash; // Don't send password hash

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { displayName, photoURL } = req.body;

    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (photoURL) updates.photoURL = photoURL;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    await db.collection('users').doc(userId).update(updates);

    const updatedUser = await db.collection('users').doc(userId).get();
    const userData = updatedUser.data();
    delete userData.passwordHash;

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};
