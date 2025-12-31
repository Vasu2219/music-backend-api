const { getFirestore, getAuth } = require('../config/firebase.config');
const bcrypt = require('bcryptjs');

/**
 * Initialize admin user in both Firebase Authentication and Firestore
 * Run this once to set up the admin user
 * 
 * IMPORTANT: Change these credentials before deploying to production!
 */
const initializeAdmin = async () => {
  try {
    const db = getFirestore();
    const auth = getAuth();
    
    // Admin user configuration
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hermonkeerthanalu.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2025!SecurePass';
    const adminName = process.env.ADMIN_NAME || 'Administrator';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    let firebaseUserId;
    
    // Step 1: Create or get user in Firebase Authentication
    try {
      // Try to get existing user
      const existingUser = await auth.getUserByEmail(adminEmail);
      firebaseUserId = existingUser.uid;
      
      // Update password
      await auth.updateUser(firebaseUserId, {
        password: adminPassword,
        displayName: adminName
      });
      console.log('✅ Firebase Auth user updated:', firebaseUserId);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user in Firebase Authentication
        const userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: adminName,
          emailVerified: true
        });
        firebaseUserId = userRecord.uid;
        console.log('✅ Firebase Auth user created:', firebaseUserId);
      } else {
        throw error;
      }
    }
    
    // Step 2: Create or update user in Firestore
    const adminData = {
      userId: firebaseUserId,
      email: adminEmail,
      displayName: adminName,
      role: 'admin',
      passwordHash: hashedPassword,
      authProvider: 'email',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&size=200`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      permissions: {
        manageSongs: true,
        manageUsers: true,
        managePlaylists: true,
        manageImages: true,
        viewActivities: true,
        manageSettings: true,
        deleteContent: true,
        viewStatistics: true
      }
    };
    
    const usersRef = db.collection('users');
    
    // Use Firebase UID as document ID
    await usersRef.doc(firebaseUserId).set(adminData, { merge: true });
    console.log('✅ Firestore admin document created/updated:', firebaseUserId);
    console.log('   Email:', adminEmail);
    console.log('   Role: admin');
    console.log('   🎉 Admin setup complete!');
    
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
  }
};

/**
 * Verify if a user is admin
 */
const isAdmin = async (userId) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Verify if a user has specific permission
 */
const hasPermission = async (userId, permission) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData.role === 'admin' && userData.permissions?.[permission] === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

module.exports = {
  initializeAdmin,
  isAdmin,
  hasPermission
};
