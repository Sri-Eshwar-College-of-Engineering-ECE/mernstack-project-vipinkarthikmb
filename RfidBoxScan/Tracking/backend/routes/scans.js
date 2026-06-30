const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

router.post('/', scanController.createScan);
router.get('/', scanController.getScans);
router.get('/counts', scanController.getSectionCounts);
router.get('/boxes/:boxType', scanController.getBoxesByType);
router.get('/missing/:boxType', scanController.getMissingBoxes);

module.exports = router;
