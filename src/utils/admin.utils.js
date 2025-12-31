const { getFirestore } = require('../config/firebase.config');
const bcrypt = require('bcryptjs');

/**
 * Initialize admin user in Firestore
 * Run this once to set up the admin user
 * 
 * IMPORTANT: Change these credentials before deploying to production!
 */
const initializeAdmin = async () => {
  try {
    const db = getFirestore();
    
    // Admin user configuration
    // TODO: Update these credentials with your organization's admin details
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2025!SecurePass';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@hermonkeerthanalu.com',
      displayName: process.env.ADMIN_NAME || 'Administrator',
      role: 'admin',
      passwordHash: hashedPassword, // Store hashed password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    
    // Check if admin already exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', adminData.email).get();
    
    if (snapshot.empty) {
      // Create admin user document
      const adminRef = await usersRef.add(adminData);
      console.log('✅ Admin user created with ID:', adminRef.id);
      console.log('   Email:', adminData.email);
      console.log('   Role:', adminData.role);
      console.log('   ⚠️  Remember to create this user in Firebase Authentication!');
    } else {
      // Update existing admin
      const docId = snapshot.docs[0].id;
      await usersRef.doc(docId).update({
        role: 'admin',
        passwordHash: hashedPassword, // Update with hashed password
        permissions: adminData.permissions,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Admin user updated with ID:', docId);
    }
    
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
