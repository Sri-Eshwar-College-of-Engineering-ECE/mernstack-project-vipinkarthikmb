const router = require('express').Router();
const auth = require('../middleware/auth');
const { db, FieldValue } = require('../services/firebase');
const { COLLECTIONS, toPlainDoc } = require('../services/store');

function normalizeUserId(req) {
  return req.user?.uid || req.auth?.uid || null;
}

function buildClaimQuery(userId, limit = 20) {
  return db.collection(COLLECTIONS.claims)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit);
}

// GET /api/claims/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const snapshot = await buildClaimQuery(userId, 40).get();
    return res.json(snapshot.docs.map(toPlainDoc).filter(Boolean));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/claims/all
router.get('/all', auth, async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.claims)
      .orderBy('createdAt', 'desc')
      .limit(80)
      .get();

    return res.json(snapshot.docs.map(toPlainDoc).filter(Boolean));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/claims/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const snapshot = await buildClaimQuery(userId, 200).get();
    const claims = snapshot.docs.map(toPlainDoc).filter(Boolean);
    const paidClaims = claims.filter((claim) => claim.payoutStatus === 'paid');
    const totalPayout = paidClaims.reduce((sum, claim) => sum + Number(claim.payoutAmount || 0), 0);

    return res.json({
      totalClaims: claims.length,
      paidClaims: paidClaims.length,
      totalPayout
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/claims/manual
router.post('/manual', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const triggerType = String(req.body?.triggerType || 'rainfall');
    const payoutStatus = String(req.body?.payoutStatus || 'pending').toLowerCase();
    const payoutAmount = Number(req.body?.payoutAmount || 0);

    const claimPayload = {
      userId,
      triggerType,
      payoutStatus,
      payoutAmount,
      source: 'manual-ui',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const claimRef = await db.collection(COLLECTIONS.claims).add(claimPayload);

    if (payoutStatus === 'paid') {
      await db.collection(COLLECTIONS.payouts).add({
        userId,
        claimId: claimRef.id,
        amount: payoutAmount,
        status: 'paid',
        source: 'manual-ui',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    const snapshot = await claimRef.get();
    return res.status(201).json(toPlainDoc(snapshot));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/claims/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const claimId = String(req.params.id || '').trim();
    const payoutStatus = String(req.body?.payoutStatus || '').trim().toLowerCase();

    if (!claimId || !payoutStatus) {
      return res.status(400).json({ error: 'claim id and payoutStatus are required' });
    }

    const claimRef = db.collection(COLLECTIONS.claims).doc(claimId);
    const snapshot = await claimRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = toPlainDoc(snapshot);
    if (claim.userId !== userId) {
      return res.status(403).json({ error: 'Claim does not belong to current user' });
    }

    await claimRef.set({
      payoutStatus,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    if (payoutStatus === 'paid') {
      await db.collection(COLLECTIONS.payouts).add({
        userId,
        claimId,
        amount: Number(claim.payoutAmount || 0),
        status: 'paid',
        source: 'manual-ui',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    const updated = await claimRef.get();
    return res.json(toPlainDoc(updated));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
