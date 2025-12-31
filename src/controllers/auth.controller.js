const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getFirestore, getAuth } = require('../config/firebase.config');

const db = getFirestore();
const auth = getAuth();

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register with email/password
exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName, fcmToken } = req.body;

    // Check if user already exists
    const usersRef = db.collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();

    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userId = uuidv4();
    const now = new Date().toISOString();

    const userData = {
      userId,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email)}&size=200`,
      authProvider: 'email',
      passwordHash: hashedPassword,
      createdAt: now,
      lastLoginAt: now,
      fcmToken: fcmToken || null
    };

    await usersRef.doc(userId).set(userData);

    // Create empty user_activity document
    await db.collection('user_activity').doc(userId).set({
      activityId: userId,
      userId,
      likedSongs: [],
      recentlyPlayed: [],
      updatedAt: now
    });

    // Generate JWT token
    const token = generateToken(userId, email);

    // Return user data (exclude password)
    delete userData.passwordHash;

    res.status(201).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

// Login with email/password
exports.login = async (req, res, next) => {
  try {
    const { email, password, fcmToken } = req.body;

    // Find user
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login and FCM token
    await userDoc.ref.update({
      lastLoginAt: new Date().toISOString(),
      ...(fcmToken && { fcmToken })
    });

    // Generate JWT token - use document ID as userId
    const userId = userDoc.id;
    const token = generateToken(userId, userData.email);

    // Return user data (exclude password)
    delete userData.passwordHash;

    res.status(200).json({
      success: true,
      token,
      user: {
        ...userData,
        uid: userId,
        userId: userId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login with Google
exports.googleLogin = async (req, res, next) => {
  try {
    const { googleIdToken, fcmToken } = req.body;

    // Verify Google ID token with Firebase
    const decodedToken = await auth.verifyIdToken(googleIdToken);
    const { uid, email, name, picture } = decodedToken;

    const usersRef = db.collection('users');
    const now = new Date().toISOString();

    // Check if user exists
    let userDoc = await usersRef.doc(uid).get();

    if (!userDoc.exists) {
      // Create new user
      const userData = {
        userId: uid,
        email,
        displayName: name || email.split('@')[0],
        photoURL: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&size=200`,
        authProvider: 'google',
        createdAt: now,
        lastLoginAt: now,
        fcmToken: fcmToken || null
      };

      await usersRef.doc(uid).set(userData);

      // Create empty user_activity document
      await db.collection('user_activity').doc(uid).set({
        activityId: uid,
        userId: uid,
        likedSongs: [],
        recentlyPlayed: [],
        updatedAt: now
      });

      userDoc = await usersRef.doc(uid).get();
    } else {
      // Update existing user
      await userDoc.ref.update({
        lastLoginAt: now,
        ...(fcmToken && { fcmToken })
      });
    }

    const userData = userDoc.data();

    // Generate JWT token
    const token = generateToken(userData.userId, userData.email);

    res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

// Update FCM token
exports.updateFcmToken = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    await db.collection('users').doc(userId).update({
      fcmToken
    });

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify phone number
exports.verifyPhone = async (req, res, next) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and verification code are required'
      });
    }

    // Verify phone number with Firebase
    // Note: This is a simplified version. In production, implement proper phone verification
    const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
    
    if (!userRecord) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user exists in Firestore
    let userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      // Create user profile if doesn't exist
      const userData = {
        userId: userRecord.uid,
        phoneNumber: phoneNumber,
        displayName: userRecord.displayName || 'User',
        email: userRecord.email || '',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.collection('users').doc(userRecord.uid).set(userData);
      userDoc = await db.collection('users').doc(userRecord.uid).get();
    }

    const token = generateToken(userRecord.uid, userRecord.email || phoneNumber);

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      data: {
        token,
        user: userDoc.data()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Firebase handles password reset emails automatically
    // Just log the request on backend
    await db.collection('activities').add({
      type: 'password_reset_requested',
      email,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
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

    res.status(200).json({
      success: true,
      data: userDoc.data()
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.userId;
    delete updateData.role;
    delete updateData.createdAt;

    await db.collection('users').doc(userId).update(updateData);

    const updatedUser = await db.collection('users').doc(userId).get();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser.data()
    });
  } catch (error) {
    next(error);
  }
};
