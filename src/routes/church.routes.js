const express = require('express');
const router = express.Router();
const { ChurchController, AppConfigController } = require('../controllers/church.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

router.get('/info', ChurchController.getChurchInfo);
router.put('/info', authenticate, requireAdmin, ChurchController.updateChurchInfo);

router.get('/gallery', ChurchController.getGallery);
router.post('/gallery', authenticate, requireAdmin, ChurchController.addGalleryImage);
router.put('/gallery/:id', authenticate, requireAdmin, ChurchController.updateGalleryImage);
router.delete('/gallery/:id', authenticate, requireAdmin, ChurchController.deleteGalleryImage);

router.get('/config', AppConfigController.getConfig);
router.put('/config', authenticate, requireAdmin, AppConfigController.updateConfig);
router.put('/config/theme', authenticate, requireAdmin, AppConfigController.updateTheme);
router.put('/config/icon', authenticate, requireAdmin, AppConfigController.updateAppIcon);

module.exports = router;
