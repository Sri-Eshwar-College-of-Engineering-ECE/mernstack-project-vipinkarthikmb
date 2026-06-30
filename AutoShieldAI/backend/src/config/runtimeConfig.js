function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getRuntimeConfig() {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || 'autoshieldai4',
    triggerIntervalMinutes: optionalNumber('TRIGGER_INTERVAL_MINUTES', 5),
    triggerConcurrency: optionalNumber('TRIGGER_CONCURRENCY', 20),
    apiMaxInstances: optionalNumber('API_MAX_INSTANCES', 40),
    apiConcurrency: optionalNumber('API_CONCURRENCY', 80),
    schedulerSecret: process.env.SCHEDULER_SHARED_SECRET || '',
    aiRiskUrl: process.env.AI_RISK_URL || '',
    aiFraudUrl: process.env.AI_FRAUD_URL || ''
  };
}

module.exports = {
  getRuntimeConfig,
  required
};
