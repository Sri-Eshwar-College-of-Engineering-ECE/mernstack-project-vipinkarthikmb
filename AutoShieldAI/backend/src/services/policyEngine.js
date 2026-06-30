const axios = require('axios');
const { db, FieldValue } = require('./firebase');
const { COLLECTIONS, appendAuditLog, toPlainDoc } = require('./store');

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

function calculateFallbackPricing(profile, environment = {}) {
  const zoneFactor = profile.zone === 'urban' ? 1.2 : profile.zone === 'rural' ? 0.85 : 1;
  const weatherPressure = (environment.rainfall > 40 ? 0.18 : 0) + (environment.aqi > 250 ? 0.16 : 0) + (environment.temperature > 40 ? 0.14 : 0);
  const riskScore = Math.min(0.95, 0.22 + weatherPressure + Math.min(profile.avgIncome / 40000, 0.22));
  const weeklyPremium = Math.round(Math.max(25, Math.min(120, 24 + (riskScore * 70 * zoneFactor))));

  return {
    premium: weeklyPremium,
    riskScore: Number(riskScore.toFixed(3)),
    riskLevel: riskScore >= 0.7 ? 'high' : riskScore >= 0.4 ? 'medium' : 'low',
    breakdown: {
      base: 24,
      riskMultiplier: Number(riskScore.toFixed(3)),
      zoneFactor: profile.zone || 'semi-urban',
      final: weeklyPremium
    }
  };
}

async function calculatePremium(profile, environment = {}) {
  try {
    const { data } = await axios.post(`${AI_URL()}/calculate-premium`, {
      zone: profile.zone,
      avgIncome: profile.avgIncome,
      rainfall: environment.rainfall ?? 10,
      temperature: environment.temperature ?? 32,
      aqi: environment.aqi ?? 100,
      demandDrop: environment.demandDrop ?? 10
    }, { timeout: 6000 });

    return data;
  } catch {
    return calculateFallbackPricing(profile, environment);
  }
}

async function createOrRenewPolicy(profile, environment = {}, extras = {}) {
  const pricing = await calculatePremium(profile, environment);
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const policyPayload = {
    userId: profile.uid,
    weeklyPremium: Number(pricing.premium || pricing.weeklyPremium || 0),
    riskLevel: pricing.riskLevel || 'medium',
    riskScore: Number(pricing.riskScore || 0.5),
    coverageAmount: Number(profile.avgIncome || extras.coverageAmount || 0) * 2,
    startDate: FieldValue.serverTimestamp(),
    endDate,
    status: 'active',
    premiumBreakdown: pricing.breakdown || null,
    billingCycle: 'monthly',
    walletBalance: Number(extras.walletBalance || 0),
    reserveRatio: Number(extras.reserveRatio || 0.2),
    zone: profile.zone,
    vehicleType: profile.vehicleType,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  const policyRef = await db.collection(COLLECTIONS.policies).add(policyPayload);
  await db.collection(COLLECTIONS.users).doc(profile.uid).set({
    activePolicyId: policyRef.id,
    subscriptionStatus: 'active',
    walletBalance: Number(extras.walletBalance || 0),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await appendAuditLog({
    type: 'policy_created',
    userId: profile.uid,
    policyId: policyRef.id,
    metadata: {
      riskLevel: policyPayload.riskLevel,
      riskScore: policyPayload.riskScore,
      premium: policyPayload.weeklyPremium,
      source: extras.source || 'manual'
    }
  });

  const snapshot = await policyRef.get();
  return toPlainDoc(snapshot);
}

async function getActivePolicy(uid) {
  const snapshot = await db.collection(COLLECTIONS.policies)
    .where('userId', '==', uid)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  return snapshot.empty ? null : toPlainDoc(snapshot.docs[0]);
}

async function listPolicyHistory(uid, limit = 25) {
  const snapshot = await db.collection(COLLECTIONS.policies)
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(toPlainDoc).filter(Boolean);
}

module.exports = {
  calculateFallbackPricing,
  calculatePremium,
  createOrRenewPolicy,
  getActivePolicy,
  listPolicyHistory
};