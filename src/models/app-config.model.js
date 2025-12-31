const { getFirestore } = require('../config/firebase.config');

class AppConfigModel {
  constructor() {
    this.collection = 'app_config';
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  async getConfig() {
    const db = this.getDb();
    const snapshot = await db.collection(this.collection).limit(1).get();
    
    if (snapshot.empty) {
      return this.createDefaultConfig();
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async createDefaultConfig() {
    const db = this.getDb();
    const configRef = db.collection(this.collection).doc();
    
    const defaultConfig = {
      id: configRef.id,
      appName: 'HERMON KEERTHANALU',
      appNameTelugu: 'హెర్మోన్ కీర్తనలు',
      splashText: 'PRAISE THE LORD',
      splashTextTelugu: 'యెహోవాను స్తుతించుడి',
      primaryColor: '#1976D2',
      secondaryColor: '#FFA726',
      accentColor: '#4CAF50',
      appIcon: null,
      appLogo: null,
      splashBackground: null,
      theme: 'professional',
      fontSizeMultiplier: 1.0,
      enableNotifications: true,
      enableYouTube: true,
      enableSharing: true,
      enableOfflineMode: true,
      version: '1.0.0',
      minVersion: '1.0.0',
      forceUpdate: false,
      maintenanceMode: false,
      updatedAt: new Date().toISOString()
    };

    await configRef.set(defaultConfig);
    return defaultConfig;
  }

  async updateConfig(updateData) {
    const db = this.getDb();
    const config = await this.getConfig();
    
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await db.collection(this.collection).doc(config.id).update(updates);
    return this.getConfig();
  }

  async updateTheme(themeData) {
    return this.updateConfig({
      primaryColor: themeData.primaryColor,
      secondaryColor: themeData.secondaryColor,
      accentColor: themeData.accentColor,
      theme: themeData.theme
    });
  }

  async updateAppIcon(iconUrl) {
    return this.updateConfig({ appIcon: iconUrl });
  }

  async updateAppLogo(logoUrl) {
    return this.updateConfig({ appLogo: logoUrl });
  }
}

module.exports = new AppConfigModel();
