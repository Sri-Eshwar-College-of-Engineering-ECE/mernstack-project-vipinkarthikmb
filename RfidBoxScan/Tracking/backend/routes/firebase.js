const express = require('express');
const router = express.Router();
const firebaseService = require('../services/firebaseService');

// Manual sync endpoint
router.post('/sync', async (req, res) => {
  try {
    const result = await firebaseService.syncFirebaseToDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Firebase data directly
router.get('/data', async (req, res) => {
  try {
    const data = await firebaseService.fetchFirebaseData();
    const transformedData = firebaseService.transformFirebaseData(data);
    res.json({
      raw: data,
      transformed: transformedData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sync status
router.get('/sync/status', (req, res) => {
  const status = firebaseService.getSyncStatus();
  res.json(status);
});

// Start auto-sync
router.post('/sync/start', (req, res) => {
  const { intervalMinutes = 2 } = req.body;
  firebaseService.startAutoSync(intervalMinutes);
  res.json({ message: `Auto-sync started with ${intervalMinutes} minute interval` });
});

// Stop auto-sync
router.post('/sync/stop', (req, res) => {
  firebaseService.stopAutoSync();
  res.json({ message: 'Auto-sync stopped' });
});

module.exports = router;
