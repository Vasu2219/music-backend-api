const { getFirestore } = require('../config/firebase.config');

/**
 * Initialize admin user in Firestore
 * Run this once to set up the admin user
 */
const initializeAdmin = async () => {
  try {
    const db = getFirestore();
    
    // Admin user data from Firebase project
    const adminData = {
      email: 'gvasu1292@gmail.com',
      displayName: 'Vasu',
      role: 'admin',
      password: 'Vasu@2219', // This should match Firebase Auth password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      permissions: {
        manageSongs: true,
        manageUsers: true,
        managePlaylists: true,
        viewActivities: true,
        manageSettings: true
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
    } else {
      // Update existing admin
      const docId = snapshot.docs[0].id;
      await usersRef.doc(docId).update({
        role: 'admin',
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
