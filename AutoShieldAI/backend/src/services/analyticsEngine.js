const { db } = require('./firebase');
const { COLLECTIONS, toPlainDoc } = require('./store');

async function getRevenueDashboard({ limit = 200 } = {}) {
  const [policySnap, claimSnap, payoutSnap, fraudSnap, suspiciousUsersDoc, zoneRiskDoc, repeatClaimersDoc, schedulerDoc, aiDoc] = await Promise.all([
    db.collection(COLLECTIONS.policies).orderBy('createdAt', 'desc').limit(limit).get(),
    db.collection(COLLECTIONS.claims).orderBy('createdAt', 'desc').limit(limit).get(),
    db.collection(COLLECTIONS.payouts).orderBy('createdAt', 'desc').limit(limit).get(),
    db.collection(COLLECTIONS.fraudLogs).orderBy('createdAt', 'desc').limit(limit).get(),
    db.collection(COLLECTIONS.fraudAggregates).doc('suspicious_users').get(),
    db.collection(COLLECTIONS.fraudAggregates).doc('zone_risk').get(),
    db.collection(COLLECTIONS.fraudAggregates).doc('repeat_claimers').get(),
    db.collection(COLLECTIONS.systemHealth).doc('scheduler').get(),
    db.collection(COLLECTIONS.systemHealth).doc('ai').get()
  ]);

  const policies = policySnap.docs.map(toPlainDoc).filter(Boolean);
  const claims = claimSnap.docs.map(toPlainDoc).filter(Boolean);
  const payouts = payoutSnap.docs.map(toPlainDoc).filter(Boolean);
  const fraudLogs = fraudSnap.docs.map(toPlainDoc).filter(Boolean);
  const suspiciousUsers = suspiciousUsersDoc.exists ? suspiciousUsersDoc.data() : {};
  const highRiskZones = zoneRiskDoc.exists ? zoneRiskDoc.data() : {};
  const repeatClaimers = repeatClaimersDoc.exists ? repeatClaimersDoc.data() : {};
  const scheduler = schedulerDoc.exists ? schedulerDoc.data() : {};
  const ai = aiDoc.exists ? aiDoc.data() : {};

  const totalPremiums = policies.reduce((sum, policy) => sum + Number(policy.weeklyPremium || 0), 0);
  const totalPayouts = payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
  const lossRatio = totalPremiums > 0 ? totalPayouts / totalPremiums : 0;
  const reservePool = Math.round(totalPremiums * 0.2);

  const zonePremiums = policies.reduce((accumulator, policy) => {
    const zone = policy.zone || 'semi-urban';
    if (!accumulator[zone]) {
      accumulator[zone] = { premium: 0, count: 0, riskScore: 0 };
    }
    accumulator[zone].premium += Number(policy.weeklyPremium || 0);
    accumulator[zone].riskScore += Number(policy.riskScore || 0);
    accumulator[zone].count += 1;
    return accumulator;
  }, {});

  const optimizedZones = Object.entries(zonePremiums).map(([zone, data]) => ({
    zone,
    averagePremium: Math.round(data.premium / Math.max(data.count, 1)),
    averageRiskScore: Number((data.riskScore / Math.max(data.count, 1)).toFixed(3)),
    recommendation: data.count > 0 && data.riskScore / data.count > 0.7 ? 'Increase premium band' : 'Hold premium band'
  }));

  return {
    totalPremiums,
    totalPayouts,
    lossRatio: Number(lossRatio.toFixed(3)),
    reservePool,
    activePolicies: policies.filter((policy) => policy.status === 'active').length,
    claimsProcessed: claims.length,
    fraudRate: claims.length ? Number((fraudLogs.length / claims.length).toFixed(3)) : 0,
    suspiciousUsers,
    highRiskZones,
    repeatClaimers,
    scheduler,
    ai,
    reinsuranceSimulation: {
      retainedRisk: Math.round(totalPremiums * 0.8),
      cededRisk: Math.max(0, Math.round(totalPayouts - reservePool)),
      capitalBuffer: Math.max(0, reservePool - totalPayouts)
    },
    zonePremiumOptimization: optimizedZones,
    recentClaims: claims,
    recentPayouts: payouts,
    fraudLogs
  };
}

async function getSystemHealth() {
  const [triggers, claims, payouts, fraudLogs, scheduler, ai] = await Promise.all([
    db.collection(COLLECTIONS.triggers).orderBy('createdAt', 'desc').limit(30).get(),
    db.collection(COLLECTIONS.claims).orderBy('createdAt', 'desc').limit(30).get(),
    db.collection(COLLECTIONS.payouts).orderBy('createdAt', 'desc').limit(30).get(),
    db.collection(COLLECTIONS.fraudLogs).orderBy('createdAt', 'desc').limit(30).get(),
    db.collection(COLLECTIONS.systemHealth).doc('scheduler').get(),
    db.collection(COLLECTIONS.systemHealth).doc('ai').get()
  ]);

  const schedulerData = scheduler.exists ? scheduler.data() : {};
  const aiData = ai.exists ? ai.data() : {};

  return {
    disruptions: triggers.size,
    claims: claims.size,
    payouts: payouts.size,
    fraudEvents: fraudLogs.size,
    status: triggers.size > 0 ? 'live' : 'healthy',
    scheduler: schedulerData,
    ai: aiData,
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  getRevenueDashboard,
  getSystemHealth
};