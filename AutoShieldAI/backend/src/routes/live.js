const router = require('express').Router();
const auth = require('../middleware/auth');
const { db, FieldValue } = require('../services/firebase');
const { COLLECTIONS, toPlainDoc } = require('../services/store');
const { getRevenueDashboard, getSystemHealth } = require('../services/analyticsEngine');

function normalizeUserId(req) {
  return req.user?.uid || req.auth?.uid || null;
}

router.get('/summary', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const [claimsSnap, policySnap, payoutsSnap, health] = await Promise.all([
      db.collection(COLLECTIONS.claims).where('userId', '==', userId).get(),
      db.collection(COLLECTIONS.policies).where('userId', '==', userId).where('status', '==', 'active').limit(1).get(),
      db.collection(COLLECTIONS.payouts).where('userId', '==', userId).get(),
      getSystemHealth()
    ]);

    const totalClaims = claimsSnap.size;
    const paidClaims = claimsSnap.docs.map(toPlainDoc).filter((claim) => claim?.payoutStatus === 'paid').length;
    const totalPayout = payoutsSnap.docs.map(toPlainDoc).reduce((sum, payout) => sum + Number(payout?.amount || 0), 0);

    return res.json({
      totalClaims,
      paidClaims,
      totalPayout,
      activePolicy: policySnap.empty ? null : toPlainDoc(policySnap.docs[0]),
      systemHealth: health,
      now: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', auth, async (req, res) => {
  try {
    const dashboard = await getRevenueDashboard({ limit: 120 });
    return res.json(dashboard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/stream', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const [claimsSnap, triggersSnap, fraudSnap, payoutsSnap, policiesSnap] = await Promise.all([
      db.collection(COLLECTIONS.claims).where('userId', '==', userId).orderBy('createdAt', 'desc').limit(80).get(),
      db.collection(COLLECTIONS.triggers).where('userId', '==', userId).orderBy('createdAt', 'desc').limit(40).get(),
      db.collection(COLLECTIONS.fraudLogs).where('userId', '==', userId).orderBy('createdAt', 'desc').limit(50).get(),
      db.collection(COLLECTIONS.payouts).where('userId', '==', userId).orderBy('createdAt', 'desc').limit(80).get(),
      db.collection(COLLECTIONS.policies).where('userId', '==', userId).orderBy('createdAt', 'desc').limit(120).get()
    ]);

    return res.json({
      claims: claimsSnap.docs.map(toPlainDoc).filter(Boolean),
      triggers: triggersSnap.docs.map(toPlainDoc).filter(Boolean),
      fraudLogs: fraudSnap.docs.map(toPlainDoc).filter(Boolean),
      payouts: payoutsSnap.docs.map(toPlainDoc).filter(Boolean),
      policies: policiesSnap.docs.map(toPlainDoc).filter(Boolean),
      now: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/inject', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const triggerType = String(req.body?.triggerType || 'rainfall');
    const triggerValue = Number(req.body?.triggerValue || 0);
    const payoutAmount = Math.max(450, Number(req.body?.payoutAmount || triggerValue * 10 || 450));

    const triggerRef = await db.collection(COLLECTIONS.triggers).add({
      userId,
      triggerType,
      triggerValue,
      processingStatus: 'pending',
      source: 'live-operations',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    const claimRef = await db.collection(COLLECTIONS.claims).add({
      userId,
      triggerType,
      payoutStatus: 'processing',
      payoutAmount,
      triggerId: triggerRef.id,
      source: 'live-operations',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    return res.status(201).json({
      trigger: toPlainDoc(await triggerRef.get()),
      claim: toPlainDoc(await claimRef.get())
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/queue/next', auth, async (req, res) => {
  try {
    const userId = normalizeUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authenticated user id not found' });
    }

    const nextStatus = String(req.body?.status || '').trim().toLowerCase();
    if (!['processing', 'paid', 'rejected'].includes(nextStatus)) {
      return res.status(400).json({ error: 'status must be processing, paid, or rejected' });
    }

    const queueSnap = await db.collection(COLLECTIONS.claims)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(80)
      .get();

    const queue = queueSnap.docs.map(toPlainDoc).filter(Boolean);
    const target = queue.find((claim) => ['processing', 'pending'].includes(String(claim.payoutStatus || '').toLowerCase()));

    if (!target) {
      return res.status(404).json({ error: 'No pending or processing claim found in queue' });
    }

    const claimRef = db.collection(COLLECTIONS.claims).doc(target.id);
    await claimRef.set({
      payoutStatus: nextStatus,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    if (nextStatus === 'paid') {
      await db.collection(COLLECTIONS.payouts).add({
        userId,
        claimId: target.id,
        amount: Number(target.payoutAmount || 0),
        status: 'paid',
        source: 'live-operations',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return res.json({ claim: toPlainDoc(await claimRef.get()) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
