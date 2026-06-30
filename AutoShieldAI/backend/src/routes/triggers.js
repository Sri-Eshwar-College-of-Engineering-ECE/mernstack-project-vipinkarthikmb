const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { db } = require('../services/firebase');
const { COLLECTIONS, toPlainDoc } = require('../services/store');
const { checkDisruptionTriggers, THRESHOLDS } = require('../services/triggerEngine');

// GET /api/triggers/thresholds
router.get('/thresholds', (req, res) => {
  res.json({ thresholds: THRESHOLDS });
});

// GET /api/triggers/recent
router.get('/recent', auth, async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.triggers)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return res.json(snapshot.docs.map(toPlainDoc).filter(Boolean));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/triggers/ingest
router.post('/ingest', auth, requireRole('admin', 'ops_manager'), validate([
  { field: 'zone', type: 'string', required: false, allowed: ['urban', 'semi-urban', 'rural'] },
  { field: 'source', type: 'string', required: false }
]), async (req, res) => {
  try {
    const result = await checkDisruptionTriggers({
      zone: req.user.zone,
      environment: req.body,
      source: req.body.source || 'external-feed',
      requestMeta: {
        userId: req.user.uid,
        geoZone: req.body.geoZone || req.user.zone,
        deviceFingerprint: req.body.deviceFingerprint || req.headers['user-agent'] || 'unknown'
      }
    });

    return res.json({ accepted: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/triggers/evaluate
router.post('/evaluate', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const result = await checkDisruptionTriggers({
      zone: req.user.zone,
      environment: req.body.environment || {},
      source: 'manual-evaluation',
      requestMeta: {
        userId: req.user.uid,
        geoZone: req.user.zone,
        deviceFingerprint: req.headers['user-agent'] || 'unknown'
      }
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
