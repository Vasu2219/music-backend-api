const { getFirestore } = require('../config/firebase.config');

class CategoryModel {
  constructor() {
    this.collection = 'categories';
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  async create(categoryData) {
    const db = this.getDb();
    const categoryRef = db.collection(this.collection).doc();
    
    const category = {
      id: categoryRef.id,
      name: categoryData.name,
      nameTelugu: categoryData.nameTelugu,
      description: categoryData.description || null,
      descriptionTelugu: categoryData.descriptionTelugu || null,
      icon: categoryData.icon || null,
      color: categoryData.color || '#1976D2',
      order: categoryData.order || 0,
      songCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await categoryRef.set(category);
    return category;
  }

  async findById(id) {
    const db = this.getDb();
    const doc = await db.collection(this.collection).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async findAll(activeOnly = true) {
    const db = this.getDb();
    let query = db.collection(this.collection);

    if (activeOnly) {
      query = query.where('isActive', '==', true);
    }

    query = query.orderBy('order', 'asc').orderBy('nameTelugu', 'asc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async update(id, updateData) {
    const db = this.getDb();
    const categoryRef = db.collection(this.collection).doc(id);
    
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await categoryRef.update(updates);
    return this.findById(id);
  }

  async delete(id) {
    const db = this.getDb();
    await db.collection(this.collection).doc(id).update({
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  }

  async updateSongCount(categoryName) {
    const db = this.getDb();
    const snapshot = await db.collection('songs')
      .where('category', '==', categoryName)
      .where('isActive', '==', true)
      .get();
    
    const categorySnapshot = await db.collection(this.collection)
      .where('name', '==', categoryName)
      .limit(1)
      .get();
    
    if (!categorySnapshot.empty) {
      const categoryDoc = categorySnapshot.docs[0];
      await categoryDoc.ref.update({
        songCount: snapshot.size
      });
    }
  }
}

module.exports = new CategoryModel();
