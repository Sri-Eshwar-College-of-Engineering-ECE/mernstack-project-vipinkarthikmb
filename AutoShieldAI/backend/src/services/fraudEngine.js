const { db, FieldValue } = require('./firebase');
const { COLLECTIONS, appendAuditLog } = require('./store');
const { getFraudScore } = require('./aiEngine');

function deriveFraudSignals({ profile, policy, claim, trigger, requestMeta = {}, recentClaims = [], repeatTriggerCount = 0, zoneClaimRate = 0, aiFraud = null }) {
  const reasons = [];
  let score = 5;

  const recentCount = recentClaims.length;
  if (recentCount >= 5) {
    score += 22;
    reasons.push('High claim frequency in the last 30 days');
  } else if (recentCount >= 3) {
    score += 12;
    reasons.push('Elevated claim cadence');
  }

  const deviceFingerprint = requestMeta.deviceFingerprint || 'unknown';
  if (requestMeta.lastKnownFingerprint && requestMeta.lastKnownFingerprint !== deviceFingerprint) {
    score += 16;
    reasons.push('Device fingerprint changed from historical baseline');
  }

  const geoZone = requestMeta.geoZone || claim.geoZone || profile?.zone;
  if (geoZone && profile?.zone && geoZone !== profile.zone) {
    score += 18;
    reasons.push('Claim location differs from registered service zone');
  }

  if (requestMeta.hourOfDay != null && (requestMeta.hourOfDay < 5 || requestMeta.hourOfDay > 23)) {
    score += 10;
    reasons.push('Claim submitted at an unusual hour');
  }

  const amount = Number(claim.payoutAmount || policy?.weeklyPremium || 0);
  const coverage = Number(policy?.coverageAmount || amount || 0);
  if (coverage && amount > coverage * 0.65) {
    score += 14;
    reasons.push('Payout request is high relative to available coverage');
  }

  if (requestMeta.duplicateIdentity) {
    score += 20;
    reasons.push('Potential duplicate identity detected against another account');
  }

  if (repeatTriggerCount >= 3) {
    score += 14;
    reasons.push('Repeated threshold trigger pattern detected');
  }

  if (zoneClaimRate >= 4) {
    score += 15;
    reasons.push('Zone-level anomaly detected based on high claim burst rate');
  }

  if (aiFraud?.score != null) {
    score = Math.max(score, Number(aiFraud.score));
    if (Array.isArray(aiFraud.reasons)) {
      reasons.push(...aiFraud.reasons.slice(0, 3));
    }
  }

  const normalizedScore = Math.round(Math.min(100, score));
  const riskBand = normalizedScore >= 70 ? 'high' : normalizedScore >= 40 ? 'medium' : 'low';

  return {
    score: normalizedScore,
    riskBand,
    isFraud: normalizedScore >= 65,
    reasons: reasons.length ? reasons : ['No major fraud indicators found'],
    explanation: `Fraud risk is ${riskBand} because ${reasons.length ? reasons.join('; ') : 'claim behavior aligns with expected worker patterns'}.`
  };
}

async function updateFraudAggregates({ profile, claim, result, zoneClaimRate }) {
  const suspicious = result.score >= 70;
  const repeatClaimer = result.score >= 60;

  await db.collection(COLLECTIONS.fraudAggregates).doc('suspicious_users').set({
    [profile.uid]: {
      score: result.score,
      riskBand: result.riskBand,
      lastClaimId: claim.id || null,
      updatedAt: new Date().toISOString()
    }
  }, { merge: true });

  await db.collection(COLLECTIONS.fraudAggregates).doc('zone_risk').set({
    [profile.zone || 'unknown']: {
      riskLevel: zoneClaimRate >= 4 ? 'high' : zoneClaimRate >= 2 ? 'medium' : 'low',
      zoneClaimRate,
      updatedAt: new Date().toISOString()
    }
  }, { merge: true });

  await db.collection(COLLECTIONS.fraudAggregates).doc('repeat_claimers').set({
    [profile.uid]: {
      repeat: repeatClaimer,
      score: result.score,
      lastClaimId: claim.id || null,
      updatedAt: new Date().toISOString()
    }
  }, { merge: true });

  return { suspicious, repeatClaimer };
}

async function evaluateClaimFraud({ profile, policy, claim, trigger, requestMeta = {}, aiFraudHints = {} }) {
  const recentClaimsSnapshot = await db.collection(COLLECTIONS.claims)
    .where('userId', '==', profile.uid)
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get();

  const recentClaims = recentClaimsSnapshot.docs.map((doc) => doc.data());
  const duplicateSnapshot = await db.collection(COLLECTIONS.users)
    .where('phone', '==', profile.phone)
    .limit(2)
    .get();

  const duplicateIdentity = duplicateSnapshot.size > 1;
  const deviceFingerprint = requestMeta.deviceFingerprint || requestMeta.userAgent || 'unknown';

  const repeatedTriggerSnapshot = await db.collection(COLLECTIONS.triggers)
    .where('triggerType', '==', trigger?.type || claim.triggerType)
    .where('meta.geoZone', '==', profile.zone)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  const zoneClaimSnapshot = await db.collection(COLLECTIONS.claims)
    .where('zone', '==', profile.zone)
    .orderBy('createdAt', 'desc')
    .limit(60)
    .get();

  const zoneClaimRate = zoneClaimSnapshot.size / 5;
  const aiFraud = await getFraudScore({
    profile,
    policy,
    claim,
    trigger,
    requestMeta,
    hints: aiFraudHints
  });

  const result = deriveFraudSignals({
    profile,
    policy,
    claim,
    trigger,
    requestMeta: {
      ...requestMeta,
      duplicateIdentity,
      deviceFingerprint,
      lastKnownFingerprint: profile.lastDeviceFingerprint,
      hourOfDay: new Date().getHours()
    },
    recentClaims,
    repeatTriggerCount: repeatedTriggerSnapshot.size,
    zoneClaimRate,
    aiFraud
  });

  const logRef = await db.collection(COLLECTIONS.fraudLogs).add({
    claimId: claim.id || null,
    userId: profile.uid,
    policyId: policy?.id || null,
    score: result.score,
    riskBand: result.riskBand,
    reasons: result.reasons,
    explanation: result.explanation,
    reasonCodes: result.reasons.map((reason) => reason.toLowerCase().replace(/[^a-z0-9]+/g, '_')).slice(0, 10),
    requestMeta: {
      ...requestMeta,
      deviceFingerprint,
      duplicateIdentity
    },
    createdAt: FieldValue.serverTimestamp()
  });

  await appendAuditLog({
    type: 'fraud_evaluated',
    userId: profile.uid,
    policyId: policy?.id || null,
    claimId: claim.id || null,
    metadata: {
      score: result.score,
      riskBand: result.riskBand,
      reasons: result.reasons,
      logId: logRef.id
    }
  });

  await updateFraudAggregates({
    profile,
    claim,
    result,
    zoneClaimRate
  });

  return {
    ...result,
    logId: logRef.id,
    aiFraudScore: Number(aiFraud?.score || 0)
  };
}

module.exports = {
  deriveFraudSignals,
  evaluateClaimFraud,
  updateFraudAggregates
};