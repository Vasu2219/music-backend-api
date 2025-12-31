const { initializeFirebase } = require('./config/firebase.config');
const { initializeAdmin } = require('./utils/admin.utils');

/**
 * Setup Script
 * Run this script once to initialize Firebase and create admin user
 * 
 * Usage: node setup.js
 */

async function setup() {
  console.log('🚀 Starting setup...\n');
  
  try {
    // Step 1: Initialize Firebase
    console.log('1️⃣ Initializing Firebase...');
    initializeFirebase();
    console.log('   ✅ Firebase initialized\n');
    
    // Step 2: Create Admin User
    console.log('2️⃣ Setting up admin user...');
    await initializeAdmin();
    console.log('   ✅ Admin user configured\n');
    
    console.log('✨ Setup completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log('   Email: gvasu1292@gmail.com');
    console.log('   Password: Vasu@2219');
    console.log('   Role: admin');
    console.log('\n⚠️ IMPORTANT: Create this user in Firebase Authentication console!');
    console.log('   1. Go to Firebase Console → Authentication');
    console.log('   2. Add user with the email above');
    console.log('   3. Set password as: Vasu@2219');
    console.log('\n🎉 You can now start the server: npm start\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();
