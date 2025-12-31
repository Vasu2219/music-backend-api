# Admin User Setup Guide

## Default Admin Credentials

The application comes with a professional admin setup that uses environment variables for security.

### Default Credentials (Change These!)

```
Email: admin@hermonkeerthanalu.com
Password: Admin@2025!SecurePass
Display Name: Administrator
```

⚠️ **IMPORTANT**: These are default credentials and **MUST** be changed before deploying to production!

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in the `backend-api` folder and add:

```env
ADMIN_EMAIL=your-admin@yourdomain.com
ADMIN_NAME=Your Admin Name
ADMIN_PASSWORD=YourSecurePassword123!
```

### 2. Create Admin User in Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **songs (songs-bfe79)**
3. Navigate to **Authentication** > **Users**
4. Click **Add User**
5. Enter the same email and password from your `.env` file
6. Click **Add User**

### 3. Initialize Admin in Firestore

Run the admin initialization script:

```bash
cd backend-api
node -e "require('./src/utils/admin.utils').initializeAdmin()"
```

Or include it in your server startup (already configured in `server.js`).

### 4. Verify Admin Access

1. Open the Android app
2. Login with your admin credentials
3. You should see the admin menu icon (⚙️) in the top right of the home screen
4. Access the Admin Dashboard to manage:
   - Songs
   - Users
   - Playlists
   - Images
   - View Statistics

## Admin Permissions

The admin user has the following permissions:

- ✅ Manage Songs (Upload, Edit, Delete)
- ✅ Manage Users (View, Update Roles)
- ✅ Manage Playlists (Create, Edit, Delete)
- ✅ Manage Images (Upload, Delete from Gallery)
- ✅ View Activities (User Activity Logs)
- ✅ View Statistics (Dashboard Analytics)
- ✅ Delete Content (Songs, Images)
- ✅ Manage Settings

## Security Best Practices

1. **Use Strong Passwords**: Minimum 12 characters with uppercase, lowercase, numbers, and special characters
2. **Change Default Credentials**: Never use the default credentials in production
3. **Use Environment Variables**: Keep credentials in `.env` file (not committed to git)
4. **Regular Updates**: Change admin password regularly
5. **Limit Access**: Only grant admin access to trusted personnel
6. **Monitor Activities**: Regularly check admin activity logs
7. **Enable 2FA**: Consider implementing Two-Factor Authentication for admin accounts

## Troubleshooting

### Admin Menu Not Showing

1. Verify you're logged in with the correct admin email
2. Check that the user has `role: 'admin'` in Firestore
3. Clear app data and login again
4. Check Android logs for any errors

### Cannot Access Admin Features

1. Verify Firebase Authentication user exists
2. Check Firestore document has correct role and permissions
3. Ensure JWT token is valid
4. Check backend logs for authentication errors

### Password Reset

To reset admin password:

1. Go to Firebase Console > Authentication
2. Find the admin user
3. Click three dots > Reset Password
4. Update password in Firebase Auth and `.env` file
5. Re-run admin initialization script

## Support

For issues or questions, contact the development team or check the main README.md file.
