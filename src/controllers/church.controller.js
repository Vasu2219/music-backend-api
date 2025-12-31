const churchModel = require('../models/church.model');
const appConfigModel = require('../models/app-config.model');

class ChurchController {
  async getChurchInfo(req, res, next) {
    try {
      const info = await churchModel.getInfo();

      res.status(200).json({
        success: true,
        data: info
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChurchInfo(req, res, next) {
    try {
      const info = await churchModel.updateInfo(req.body);

      res.status(200).json({
        success: true,
        data: info
      });
    } catch (error) {
      next(error);
    }
  }

  async getGallery(req, res, next) {
    try {
      const images = await churchModel.getGalleryImages(true);

      res.status(200).json({
        success: true,
        count: images.length,
        data: images
      });
    } catch (error) {
      next(error);
    }
  }

  async addGalleryImage(req, res, next) {
    try {
      const image = await churchModel.addGalleryImage(req.body);

      res.status(201).json({
        success: true,
        data: image
      });
    } catch (error) {
      next(error);
    }
  }

  async updateGalleryImage(req, res, next) {
    try {
      const { id } = req.params;
      await churchModel.updateGalleryImage(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Gallery image updated'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteGalleryImage(req, res, next) {
    try {
      const { id } = req.params;
      await churchModel.deleteGalleryImage(id);

      res.status(200).json({
        success: true,
        message: 'Gallery image deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}

class AppConfigController {
  async getConfig(req, res, next) {
    try {
      const config = await appConfigModel.getConfig();

      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(req, res, next) {
    try {
      const config = await appConfigModel.updateConfig(req.body);

      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTheme(req, res, next) {
    try {
      const config = await appConfigModel.updateTheme(req.body);

      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAppIcon(req, res, next) {
    try {
      const { iconUrl } = req.body;
      const config = await appConfigModel.updateAppIcon(iconUrl);

      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  ChurchController: new ChurchController(),
  AppConfigController: new AppConfigController()
};
