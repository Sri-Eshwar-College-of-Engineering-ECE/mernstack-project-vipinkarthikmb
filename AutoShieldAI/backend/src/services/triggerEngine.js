const { db, FieldValue } = require('./firebase');
const { COLLECTIONS, appendAuditLog, getUserProfile, toPlainDoc } = require('./store');
const { fetchEnvironmentalSnapshot, detectTrigger } = require('./externalData');
const { evaluateClaimFraud } = require('./fraudEngine');
const { computePayout, createPayoutRecord } = require('./payoutEngine');
const { getRiskScore } = require('./aiEngine');
const { logError, logInfo, logWarn } = require('./logger');

const THRESHOLDS = {
  rainfall: 50,
  temperature: 42,
  aqi: 300,
  demandDrop: 60
};

const SEVERITY_MAP = {
  rainfall: { hours: 3, label: 'Heavy rainfall' },
  temperature: { hours: 2, label: 'Extreme heat' },
  aqi: { hours: 2, label: 'Poor air quality' },
  demand_drop: { hours: 4, label: 'Demand drop' },
  curfew: { hours: 6, label: 'Curfew / shutdown' }
};

async function ensureTriggerLog(environment, trigger, meta = {}) {
  const ref = await db.collection(COLLECTIONS.triggers).add({
    environment,
    triggerType: trigger?.type || null,
    triggerValue: trigger?.value ?? null,
    threshold: trigger?.threshold ?? null,
    label: trigger?.label || null,
    source: meta.source || environment.source || 'external-feed',
    schedulerRunId: meta.schedulerRunId || null,
    processingStatus: 'pending',
    meta,
    createdAt: FieldValue.serverTimestamp()
  });

  return ref.id;
}

async function createClaimForPolicy({ profile, policy, environment, trigger, requestMeta = {}, triggerDocId }) {
  const severity = SEVERITY_MAP[trigger.type] || { hours: 2, label: trigger.label };
  const hoursLost = severity.hours;
  const hourlyRate = Number(profile.avgIncome || 0) / 56;
  const incomeLoss = Number((hourlyRate * hoursLost).toFixed(2));

  const riskModel = await getRiskScore({
    profile,
    policy,
    trigger,
    environment,
    requestMeta
  });

  const aiRiskScore = Number(riskModel?.riskScore || policy?.riskScore || 0.45);
  const payoutAmount = computePayout({
    policy: {
      ...policy,
      riskScore: aiRiskScore
    },
    incomeLoss,
    severityMultiplier: 0.8
  });

  const claimRef = await db.collection(COLLECTIONS.claims).add({
    userId: profile.uid,
    policyId: policy.id,
    triggerType: trigger.type,
    triggerValue: trigger.value,
    triggerData: environment,
    hoursLost,
    incomeLoss,
    payoutAmount,
    payoutStatus: 'processing',
    autoTriggered: true,
    riskScore: aiRiskScore,
    aiRiskBand: riskModel?.riskBand || 'medium',
    aiRiskExplanation: riskModel?.explanation || null,
    triggerDocId,
    zone: profile.zone,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const claimSnapshot = await claimRef.get();
  const claim = toPlainDoc(claimSnapshot);
  const fraudResult = await evaluateClaimFraud({
    profile,
    policy,
    claim,
    trigger,
    requestMeta,
    aiFraudHints: {
      aiRiskScore,
      riskBand: riskModel?.riskBand || 'medium'
    }
  });

  let payout = null;
  const payoutStatus = fraudResult.isFraud ? 'rejected' : 'paid';

  await claimRef.update({
    fraudScore: fraudResult.score,
    fraudReasons: fraudResult.reasons,
    fraudExplanation: fraudResult.explanation,
    payoutStatus,
    updatedAt: FieldValue.serverTimestamp()
  });

  if (!fraudResult.isFraud) {
    payout = await createPayoutRecord({
      claim: { ...claim, payoutAmount },
      profile,
      policy,
      reserveRatio: Number(policy.reserveRatio || 0.2)
    });
  }

  await appendAuditLog({
    type: fraudResult.isFraud ? 'claim_rejected' : 'claim_created',
    userId: profile.uid,
    policyId: policy.id,
    claimId: claim.id,
    metadata: {
      triggerType: trigger.type,
      payoutAmount,
      fraudScore: fraudResult.score,
      reasons: fraudResult.reasons,
      payoutStatus
    }
  });

  return {
    claimId: claim.id,
    payoutId: payout?.id || null,
    fraudResult,
    payoutStatus,
    payoutAmount,
    hoursLost
  };
}

async function listActivePolicies(limit = 250) {
  const policies = [];
  let cursor = null;

  while (policies.length < limit) {
    let query = db.collection(COLLECTIONS.policies)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(Math.min(120, limit - policies.length));

    if (cursor) {
      query = query.startAfter(cursor);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    for (const doc of snapshot.docs) {
      policies.push(toPlainDoc(doc));
    }

    cursor = snapshot.docs[snapshot.docs.length - 1];
  }

  return policies.filter(Boolean);
}

async function processTriggerDocument(triggerDoc, context = {}) {
  const trigger = triggerDoc?.triggerType
    ? {
      type: triggerDoc.triggerType,
      value: triggerDoc.triggerValue,
      threshold: triggerDoc.threshold,
      label: triggerDoc.label
    }
    : null;

  const environment = triggerDoc?.environment || {};

  if (!trigger) {
    await db.collection(COLLECTIONS.triggers).doc(triggerDoc.id).set({
      processingStatus: 'no_disruption',
      processedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      triggered: false,
      claims: []
    };
  }

  const policies = await listActivePolicies(context.limit || 600);
  const results = [];
  const concurrency = Math.max(1, Number(process.env.TRIGGER_CONCURRENCY || 20));

  for (let index = 0; index < policies.length; index += concurrency) {
    const batch = policies.slice(index, index + concurrency);
    const outcomes = await Promise.all(batch.map(async (policy) => {
      const profile = await getUserProfile(policy.userId);
      if (!profile) {
        return null;
      }

      return createClaimForPolicy({
        profile,
        policy,
        environment,
        trigger,
        triggerDocId: triggerDoc.id,
        requestMeta: {
          ...context.requestMeta,
          geoZone: profile.zone,
          deviceFingerprint: context.requestMeta?.deviceFingerprint || 'scheduler'
        }
      });
    }));

    for (const outcome of outcomes) {
      if (outcome) {
        results.push(outcome);
      }
    }
  }

  await db.collection(COLLECTIONS.triggers).doc(triggerDoc.id).set({
    processingStatus: 'processed',
    processedClaims: results.length,
    processedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await db.collection(COLLECTIONS.systemHealth).doc('ai').set({
    status: 'healthy',
    lastProcessedTriggerId: triggerDoc.id,
    lastProcessedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    triggered: true,
    triggerType: trigger.type,
    claims: results,
    triggerLogId: triggerDoc.id
  };
}

async function ingestEnvironmentalTriggerSnapshot(context = {}) {
  const environment = await fetchEnvironmentalSnapshot({
    zone: context.zone,
    activePolicies: context.activePoliciesCount || 0,
    claimsToday: context.claimsToday || 0
  });
  const trigger = detectTrigger(environment);
  const schedulerRunId = context.schedulerRunId || `${Date.now()}`;

  if (!trigger) {
    const triggerLogId = await ensureTriggerLog(environment, null, {
      source: context.source || 'scheduled-evaluator',
      status: 'no-disruption',
      schedulerRunId
    });

    await db.collection(COLLECTIONS.systemHealth).doc('scheduler').set({
      status: 'ok',
      lastExecution: FieldValue.serverTimestamp(),
      lastTriggerLogId: triggerLogId,
      source: context.source || 'scheduled-evaluator',
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    await appendAuditLog({
      type: 'trigger_idle',
      metadata: {
        environment,
        schedulerRunId,
        source: context.source || 'scheduled-evaluator'
      }
    });

    return {
      triggered: false,
      environment,
      claims: [],
      schedulerRunId
    };
  }

  const triggerLogId = await ensureTriggerLog(environment, trigger, {
    source: context.source || 'scheduled-evaluator',
    schedulerRunId,
    requestMeta: context.requestMeta || {}
  });

  await db.collection(COLLECTIONS.systemHealth).doc('scheduler').set({
    status: 'ok',
    lastExecution: FieldValue.serverTimestamp(),
    lastTriggerLogId: triggerLogId,
    source: context.source || 'scheduled-evaluator',
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await appendAuditLog({
    type: 'trigger_detected',
    metadata: {
      triggerLogId,
      triggerType: trigger.type,
      triggerValue: trigger.value,
      schedulerRunId,
      source: context.source || 'scheduled-evaluator'
    }
  });

  return {
    triggered: true,
    triggerType: trigger.type,
    triggerValue: trigger.value,
    environment,
    claims: [],
    triggerLogId,
    schedulerRunId
  };
}

async function checkDisruptionTriggers(context = {}) {
  return ingestEnvironmentalTriggerSnapshot(context);
}

function isTruthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function isCredentialError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('could not load the default credentials')
    || message.includes('application default credentials')
    || message.includes('firebase admin credentials missing');
}

function startTriggerScheduler() {
  const schedulerEnabled = process.env.TRIGGER_SCHEDULER_ENABLED == null
    ? process.env.NODE_ENV === 'production'
    : isTruthy(process.env.TRIGGER_SCHEDULER_ENABLED);

  if (!schedulerEnabled) {
    logInfo('Local trigger scheduler is disabled. Set TRIGGER_SCHEDULER_ENABLED=true to enable it.', {
      source: 'local-scheduler'
    });
    return null;
  }

  const intervalMinutes = Number(process.env.TRIGGER_INTERVAL_MINUTES || 5);
  const intervalMs = Math.max(60_000, intervalMinutes * 60_000);

  if (global.__autoshieldTriggerScheduler) {
    return global.__autoshieldTriggerScheduler;
  }

  const timer = setInterval(() => {
    ingestEnvironmentalTriggerSnapshot({ source: 'local-scheduler' }).catch((error) => {
      if (isCredentialError(error)) {
        clearInterval(timer);
        global.__autoshieldTriggerScheduler = null;
        logWarn('Disabling trigger scheduler due to missing cloud credentials.', {
          source: 'local-scheduler',
          reason: error.message
        });
        return;
      }

      logError('Scheduled trigger ingestion failed', error, { source: 'local-scheduler' });
    });
  }, intervalMs);

  global.__autoshieldTriggerScheduler = timer;
  return timer;
}

module.exports = {
  THRESHOLDS,
  SEVERITY_MAP,
  checkDisruptionTriggers,
  detectTrigger,
  ingestEnvironmentalTriggerSnapshot,
  processTriggerDocument,
  startTriggerScheduler
};