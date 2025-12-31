const { getFirestore } = require('../config/firebase.config');

class SongModel {
  constructor() {
    this.collection = 'songs';
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  async create(songData) {
    const db = this.getDb();
    const songRef = db.collection(this.collection).doc();
    
    const song = {
      id: songRef.id,
      title: songData.title,
      titleTelugu: songData.titleTelugu,
      lyrics: songData.lyrics,
      lyricsTelugu: songData.lyricsTelugu,
      youtubeId: songData.youtubeId || null,
      youtubeUrl: songData.youtubeUrl || null,
      category: songData.category,
      categoryTelugu: songData.categoryTelugu,
      teluguAlphabet: this.getTeluguAlphabet(songData.titleTelugu),
      tags: songData.tags || [],
      thumbnailUrl: songData.youtubeId ? `https://img.youtube.com/vi/${songData.youtubeId}/maxresdefault.jpg` : null,
      duration: songData.duration || 0,
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: songData.createdBy
    };

    await songRef.set(song);
    return song;
  }

  async findById(id) {
    const db = this.getDb();
    const doc = await db.collection(this.collection).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async findAll(filters = {}) {
    const db = this.getDb();
    let query = db.collection(this.collection);

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters.teluguAlphabet) {
      query = query.where('teluguAlphabet', '==', filters.teluguAlphabet);
    }

    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }

    query = query.orderBy('titleTelugu', 'asc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async search(searchTerm) {
    const db = this.getDb();
    const allSongs = await this.findAll({ isActive: true });
    
    const term = searchTerm.toLowerCase();
    return allSongs.filter(song => 
      song.title?.toLowerCase().includes(term) ||
      song.titleTelugu?.includes(searchTerm) ||
      song.lyrics?.toLowerCase().includes(term) ||
      song.lyricsTelugu?.includes(searchTerm) ||
      song.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }

  async update(id, updateData) {
    const db = this.getDb();
    const songRef = db.collection(this.collection).doc(id);
    
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    if (updateData.titleTelugu) {
      updates.teluguAlphabet = this.getTeluguAlphabet(updateData.titleTelugu);
    }

    if (updateData.youtubeId) {
      updates.thumbnailUrl = `https://img.youtube.com/vi/${updateData.youtubeId}/maxresdefault.jpg`;
    }

    await songRef.update(updates);
    return this.findById(id);
  }

  async delete(id) {
    const db = this.getDb();
    await db.collection(this.collection).doc(id).update({
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  }

  async hardDelete(id) {
    const db = this.getDb();
    await db.collection(this.collection).doc(id).delete();
  }

  async incrementView(id) {
    const db = this.getDb();
    const songRef = db.collection(this.collection).doc(id);
    await songRef.update({
      viewCount: db.FieldValue.increment(1)
    });
  }

  async incrementLike(id) {
    const db = this.getDb();
    const songRef = db.collection(this.collection).doc(id);
    await songRef.update({
      likeCount: db.FieldValue.increment(1)
    });
  }

  async incrementShare(id) {
    const db = this.getDb();
    const songRef = db.collection(this.collection).doc(id);
    await songRef.update({
      shareCount: db.FieldValue.increment(1)
    });
  }

  async getByAlphabet() {
    const songs = await this.findAll({ isActive: true });
    const grouped = {};
    
    songs.forEach(song => {
      const letter = song.teluguAlphabet || 'ఇతర';
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(song);
    });

    return grouped;
  }

  async getByCategory() {
    const songs = await this.findAll({ isActive: true });
    const grouped = {};
    
    songs.forEach(song => {
      const category = song.category || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(song);
    });

    return grouped;
  }

  getTeluguAlphabet(text) {
    if (!text || text.length === 0) return 'ఇతర';
    
    const firstChar = text.charAt(0);
    const code = firstChar.charCodeAt(0);
    
    if (code >= 0x0C05 && code <= 0x0C39) {
      return firstChar;
    }
    
    return 'ఇతర';
  }
}

module.exports = new SongModel();
