const KEYS = {
  claims: 'autoshield-demo-claims',
  policies: 'autoshield-demo-policies',
  triggers: 'autoshield-demo-triggers',
  payouts: 'autoshield-demo-payouts',
  fraud: 'autoshield-demo-fraud'
};

const EVENT_NAME = 'autoshield-demo-updated';

function nowIso() {
  return new Date().toISOString();
}

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT_NAME));
}

function createSeedClaims() {
  const base = Date.now();
  const statuses = ['paid', 'processing', 'pending', 'rejected', 'paid', 'processing'];
  const triggers = ['rainfall', 'aqi', 'heatwave', 'demand_drop', 'curfew', 'rainfall'];

  return Array.from({ length: 6 }).map((_, idx) => ({
    id: `demo-claim-${base - idx}`,
    userId: 'local-user',
    triggerType: triggers[idx],
    payoutStatus: statuses[idx],
    payoutAmount: 800 + idx * 180,
    createdAt: new Date(base - idx * 600000).toISOString(),
    source: 'demo'
  }));
}

function createSeedPolicies() {
  const base = Date.now();
  return Array.from({ length: 6 }).map((_, idx) => ({
    id: `demo-policy-${base - idx}`,
    riskLevel: ['low', 'medium', 'high'][idx % 3],
    riskScore: Number((0.35 + idx * 0.08).toFixed(2)),
    weeklyPremium: 360 + idx * 45,
    coverageAmount: 6500 + idx * 550,
    status: idx === 0 ? 'active' : 'renewed',
    createdAt: new Date(base - idx * 86400000).toISOString(),
    source: 'demo'
  }));
}

function createSeedTriggers() {
  const base = Date.now();
  const types = ['rainfall', 'aqi', 'heatwave', 'demand_drop', 'curfew', 'rainfall'];
  return Array.from({ length: 6 }).map((_, idx) => ({
    id: `demo-trigger-${base - idx}`,
    triggerType: types[idx],
    triggerValue: 25 + idx * 10,
    processingStatus: idx % 2 === 0 ? 'processed' : 'pending',
    createdAt: new Date(base - idx * 540000).toISOString(),
    source: 'demo'
  }));
}

function createSeedPayouts() {
  const base = Date.now();
  return Array.from({ length: 6 }).map((_, idx) => ({
    id: `demo-payout-${base - idx}`,
    amount: 700 + idx * 120,
    status: idx % 3 === 0 ? 'paid' : 'processing',
    createdAt: new Date(base - idx * 700000).toISOString(),
    source: 'demo'
  }));
}

function createSeedFraud() {
  const base = Date.now();
  return Array.from({ length: 6 }).map((_, idx) => ({
    id: `demo-fraud-${base - idx}`,
    score: 40 + idx * 9,
    riskBand: idx > 3 ? 'high' : 'medium',
    reasons: idx > 3 ? ['claim burst', 'route mismatch'] : ['normal pattern'],
    createdAt: new Date(base - idx * 630000).toISOString(),
    source: 'demo'
  }));
}

export function ensureDemoData() {
  if (!read(KEYS.claims).length) write(KEYS.claims, createSeedClaims());
  if (!read(KEYS.policies).length) write(KEYS.policies, createSeedPolicies());
  if (!read(KEYS.triggers).length) write(KEYS.triggers, createSeedTriggers());
  if (!read(KEYS.payouts).length) write(KEYS.payouts, createSeedPayouts());
  if (!read(KEYS.fraud).length) write(KEYS.fraud, createSeedFraud());
}

export function getDemoSnapshot() {
  return {
    claims: read(KEYS.claims),
    policies: read(KEYS.policies),
    triggers: read(KEYS.triggers),
    payouts: read(KEYS.payouts),
    fraudLogs: read(KEYS.fraud)
  };
}

export function addDemoClaim(payload) {
  const claim = {
    id: `demo-claim-${Date.now()}`,
    userId: 'local-user',
    triggerType: payload.triggerType || 'rainfall',
    payoutStatus: payload.payoutStatus || 'pending',
    payoutAmount: Number(payload.payoutAmount || 0),
    createdAt: nowIso(),
    source: 'demo'
  };

  const claims = [claim, ...read(KEYS.claims)].slice(0, 80);
  write(KEYS.claims, claims);

  const fraudLogs = [
    {
      id: `demo-fraud-${Date.now()}`,
      score: Math.min(92, 35 + Number(payload.payoutAmount || 0) / 30),
      riskBand: Number(payload.payoutAmount || 0) > 1400 ? 'high' : 'medium',
      reasons: ['interactive update'],
      createdAt: nowIso(),
      source: 'demo'
    },
    ...read(KEYS.fraud)
  ].slice(0, 50);
  write(KEYS.fraud, fraudLogs);

  return claim;
}

export function updateDemoClaimStatus(claimId, status) {
  const claims = read(KEYS.claims).map((entry) => {
    if (entry.id !== claimId) return entry;
    return { ...entry, payoutStatus: status };
  });
  write(KEYS.claims, claims);

  if (status === 'paid') {
    const target = claims.find((entry) => entry.id === claimId);
    if (target) {
      const payouts = [
        {
          id: `demo-payout-${Date.now()}`,
          amount: Number(target.payoutAmount || 0),
          status: 'paid',
          createdAt: nowIso(),
          source: 'demo'
        },
        ...read(KEYS.payouts)
      ].slice(0, 80);
      write(KEYS.payouts, payouts);
    }
  }
}

export function addDemoPolicyRevision(payload) {
  const revision = {
    id: `demo-policy-${Date.now()}`,
    riskLevel: payload.riskLevel || 'medium',
    riskScore: Number(payload.riskScore || 0.5),
    weeklyPremium: Number(payload.weeklyPremium || 0),
    coverageAmount: Number(payload.coverageAmount || 0),
    status: payload.status || 'active',
    createdAt: nowIso(),
    source: 'demo'
  };

  const next = [revision, ...read(KEYS.policies)].slice(0, 120).map((entry, idx) => {
    if (idx === 0) return { ...entry, status: 'active' };
    return { ...entry, status: entry.status === 'active' ? 'renewed' : entry.status };
  });

  write(KEYS.policies, next);
  return revision;
}

export function addDemoTrigger(payload) {
  const trigger = {
    id: `demo-trigger-${Date.now()}`,
    triggerType: payload.triggerType || 'rainfall',
    triggerValue: Number(payload.triggerValue || 0),
    processingStatus: payload.processingStatus || 'pending',
    createdAt: nowIso(),
    source: 'demo'
  };

  write(KEYS.triggers, [trigger, ...read(KEYS.triggers)].slice(0, 40));
  return trigger;
}

export function subscribeDemo(callback) {
  const handler = () => callback(getDemoSnapshot());
  window.addEventListener('storage', handler);
  window.addEventListener(EVENT_NAME, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(EVENT_NAME, handler);
  };
}
