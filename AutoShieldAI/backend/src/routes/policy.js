const router = require('express').Router();
const auth = require('../middleware/auth');
const { db, FieldValue } = require('../services/firebase');
const { COLLECTIONS, toPlainDoc } = require('../services/store');
const { createOrRenewPolicy, getActivePolicy, listPolicyHistory } = require('../services/policyEngine');

function normalizeUserId(req) {
  return req.user?.uid || req.auth?.uid || null;
}

// GET /api/policy/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const policy = await getActivePolicy(userId);
    if (!policy) {
      return res.status(404).json({ error: 'No active policy found' });
    }

    return res.json(policy);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/policy/renew
router.post('/renew', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    await db.collection(COLLECTIONS.policies)
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get()
      .then((snapshot) => Promise.all(snapshot.docs.map((doc) => doc.ref.update({ status: 'expired', updatedAt: new Date().toISOString() }))));

    const policy = await createOrRenewPolicy({ ...(req.user || {}), uid: userId }, req.body || {}, { source: 'renewal' });
    return res.json(policy);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/policy/all
router.get('/all', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const policies = await listPolicyHistory(userId, 50);
    return res.json(policies);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/policy/active (compat)
router.get('/active', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const policy = await getActivePolicy(userId);
    return res.json(policy || null);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/policy/manual-update
router.post('/manual-update', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const payload = {
      riskLevel: String(req.body?.riskLevel || 'medium'),
      riskScore: Number(req.body?.riskScore || 0.5),
      weeklyPremium: Number(req.body?.weeklyPremium || 0),
      coverageAmount: Number(req.body?.coverageAmount || 0),
      status: String(req.body?.status || 'active')
    };

    const activeSnapshot = await db.collection(COLLECTIONS.policies)
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    await Promise.all(activeSnapshot.docs.map((entry) => entry.ref.update({
      status: 'renewed',
      updatedAt: FieldValue.serverTimestamp()
    })));

    const policyRef = await db.collection(COLLECTIONS.policies).add({
      userId,
      riskLevel: payload.riskLevel,
      riskScore: payload.riskScore,
      weeklyPremium: payload.weeklyPremium,
      coverageAmount: payload.coverageAmount,
      status: payload.status === 'active' ? 'active' : payload.status,
      source: 'manual-ui',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    const snapshot = await policyRef.get();
    return res.status(201).json(toPlainDoc(snapshot));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
