/**
 * Sample data seeder for testing
 * Run this after setting up your backend to populate with sample songs
 * 
 * Usage: node scripts/seed.js
 */

require('dotenv').config();
const { initializeFirebase, getFirestore, getAuth } = require('../src/config/firebase.config');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

initializeFirebase();
const db = getFirestore();
const auth = getAuth();

const sampleSongs = [
  {
    title: "Amazing Grace",
    artist: "Traditional Hymn",
    album: "Classic Hymns Vol. 1",
    duration: 245,
    youtubeURL: "https://www.youtube.com/watch?v=CDdvReNKKuk",
    lyrics: `Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost, but now I am found
Was blind, but now I see

'Twas grace that taught my heart to fear
And grace my fears relieved
How precious did that grace appear
The hour I first believed`,
    language: "en",
    category: "hymn",
    tags: ["classic", "worship", "traditional"]
  },
  {
    title: "How Great Thou Art",
    artist: "Carl Boberg",
    album: "Classic Hymns Vol. 1",
    duration: 280,
    youtubeURL: "https://www.youtube.com/watch?v=Cc13mWxVQtg",
    lyrics: `O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made
I see the stars, I hear the rolling thunder
Thy power throughout the universe displayed

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art
Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art`,
    language: "en",
    category: "hymn",
    tags: ["praise", "worship", "popular"]
  },
  {
    title: "Blessed Assurance",
    artist: "Fanny Crosby",
    album: "Classic Hymns Vol. 2",
    duration: 198,
    youtubeURL: "https://www.youtube.com/watch?v=u-1fwZtKJSM",
    lyrics: `Blessed assurance, Jesus is mine
O what a foretaste of glory divine
Heir of salvation, purchase of God
Born of His Spirit, washed in His blood

This is my story, this is my song
Praising my Savior all the day long
This is my story, this is my song
Praising my Savior all the day long`,
    language: "en",
    category: "hymn",
    tags: ["classic", "assurance", "testimony"]
  },
  {
    title: "Great Is Thy Faithfulness",
    artist: "Thomas Chisholm",
    album: "Worship Collection",
    duration: 220,
    youtubeURL: "https://www.youtube.com/watch?v=fLuFju2gHMU",
    lyrics: `Great is Thy faithfulness, O God my Father
There is no shadow of turning with Thee
Thou changest not, Thy compassions, they fail not
As Thou hast been, Thou forever will be

Great is Thy faithfulness
Great is Thy faithfulness
Morning by morning new mercies I see
All I have needed Thy hand hath provided
Great is Thy faithfulness, Lord, unto me`,
    language: "en",
    category: "worship",
    tags: ["faithfulness", "praise", "morning"]
  },
  {
    title: "It Is Well With My Soul",
    artist: "Horatio Spafford",
    album: "Hymns of Faith",
    duration: 265,
    youtubeURL: "https://www.youtube.com/watch?v=zY5o9mP22V0",
    lyrics: `When peace like a river attendeth my way
When sorrows like sea billows roll
Whatever my lot, Thou hast taught me to say
It is well, it is well with my soul

It is well with my soul
It is well, it is well with my soul`,
    language: "en",
    category: "hymn",
    tags: ["peace", "comfort", "testimony"]
  }
];

const samplePlaylists = [
  {
    name: "Top Daily Hits",
    description: "Most played worship songs today",
    type: "featured",
    order: 1
  },
  {
    name: "Classic Hymns Collection",
    description: "Traditional hymns loved for generations",
    type: "curated",
    order: 2
  },
  {
    name: "New Releases",
    description: "Newly added songs this week",
    type: "auto",
    order: 3
  },
  {
    name: "Trending Worship",
    description: "Popular worship songs right now",
    type: "featured",
    order: 4
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed songs
    console.log('📀 Adding sample songs...');
    const songIds = [];

    for (const song of sampleSongs) {
      const songId = `song_${uuidv4()}`;
      const videoIdMatch = song.youtubeURL.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';

      const songData = {
        songId,
        ...song,
        thumbnailURL: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        likeCount: Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString(),
        isActive: true
      };

      await db.collection('songs').doc(songId).set(songData);
      songIds.push(songId);
      console.log(`  ✅ Added: ${song.title}`);
    }

    console.log(`\n✨ Successfully added ${songIds.length} songs!\n`);

    // Seed playlists
    console.log('📝 Creating sample playlists...');

    for (const playlist of samplePlaylists) {
      const playlistId = `playlist_${uuidv4()}`;
      
      // Randomly assign 2-4 songs to each playlist
      const numSongs = Math.floor(Math.random() * 3) + 2;
      const playlistSongs = [...songIds]
        .sort(() => 0.5 - Math.random())
        .slice(0, numSongs);

      const playlistData = {
        playlistId,
        name: playlist.name,
        description: playlist.description,
        coverImageURL: 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(playlist.name),
        songIds: playlistSongs,
        songCount: playlistSongs.length,
        type: playlist.type,
        isPublic: true,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: playlist.order
      };

      await db.collection('playlists').doc(playlistId).set(playlistData);
      console.log(`  ✅ Created: ${playlist.name} (${playlistSongs.length} songs)`);
    }

    console.log(`\n✨ Successfully created ${samplePlaylists.length} playlists!\n`);

    console.log('🎉 Database seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   Songs: ${songIds.length}`);
    console.log(`   Playlists: ${samplePlaylists.length}`);
    console.log('\n✅ Your backend is now populated with sample data!');
    console.log('🚀 Start your server: npm run dev');
    console.log('🔍 Test endpoint: http://localhost:3000/api/v1/songs\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

/**
 * Seed admin user credentials
 */
async function seedAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hermon.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    
    console.log('🔐 Seeding admin user...');
    
    // Create admin user in Firebase Auth
    let adminUser;
    try {
      adminUser = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Admin',
        emailVerified: true
      });
      console.log('  ✅ Admin user created in Firebase Auth');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        // Get existing user
        adminUser = await auth.getUserByEmail(adminEmail);
        console.log('  ℹ️  Admin user already exists in Firebase Auth');
      } else {
        throw error;
      }
    }
    
    // Set custom claims for admin role
    await auth.setCustomUserClaims(adminUser.uid, { admin: true });
    console.log('  ✅ Admin custom claims set');
    
    // Hash the password for Firestore
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user document in Firestore
    const adminData = {
      uid: adminUser.uid,
      email: adminEmail,
      displayName: 'Admin',
      role: 'admin',
      isAdmin: true,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('users').doc(adminUser.uid).set(adminData, { merge: true });
    console.log('  ✅ Admin document created in Firestore');
    console.log('\n✅ Admin user seeded successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}\n`);
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
}

// Run seeders
async function runSeeders() {
  await seedAdminUser();
  await seedDatabase();
}

runSeeders();
