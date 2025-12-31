const { getFirestore } = require('../config/firebase.config');

class ChurchModel {
  constructor() {
    this.collection = 'church_info';
    this.galleryCollection = 'church_gallery';
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  async getInfo() {
    const db = this.getDb();
    const snapshot = await db.collection(this.collection).limit(1).get();
    
    if (snapshot.empty) {
      return this.createDefaultInfo();
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async createDefaultInfo() {
    const db = this.getDb();
    const infoRef = db.collection(this.collection).doc();
    
    const defaultInfo = {
      id: infoRef.id,
      name: 'Hermon Church',
      nameTelugu: 'హెర్మోన్ చర్చి',
      address: '',
      addressTelugu: '',
      phone: '',
      email: '',
      website: '',
      latitude: null,
      longitude: null,
      mapUrl: null,
      description: '',
      descriptionTelugu: '',
      logo: null,
      coverImage: null,
      updatedAt: new Date().toISOString()
    };

    await infoRef.set(defaultInfo);
    return defaultInfo;
  }

  async updateInfo(updateData) {
    const db = this.getDb();
    const info = await this.getInfo();
    
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await db.collection(this.collection).doc(info.id).update(updates);
    return this.getInfo();
  }

  async addGalleryImage(imageData) {
    const db = this.getDb();
    const imageRef = db.collection(this.galleryCollection).doc();
    
    const image = {
      id: imageRef.id,
      url: imageData.url,
      title: imageData.title || null,
      titleTelugu: imageData.titleTelugu || null,
      description: imageData.description || null,
      descriptionTelugu: imageData.descriptionTelugu || null,
      order: imageData.order || 0,
      isActive: true,
      uploadedAt: new Date().toISOString()
    };

    await imageRef.set(image);
    return image;
  }

  async getGalleryImages(activeOnly = true) {
    const db = this.getDb();
    let query = db.collection(this.galleryCollection);

    if (activeOnly) {
      query = query.where('isActive', '==', true);
    }

    query = query.orderBy('order', 'asc').orderBy('uploadedAt', 'desc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateGalleryImage(id, updateData) {
    const db = this.getDb();
    await db.collection(this.galleryCollection).doc(id).update(updateData);
  }

  async deleteGalleryImage(id) {
    const db = this.getDb();
    await db.collection(this.galleryCollection).doc(id).update({
      isActive: false
    });
  }
}

module.exports = new ChurchModel();
