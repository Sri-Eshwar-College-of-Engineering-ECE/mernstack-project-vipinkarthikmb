const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const app = require('./src/server');
const { db, FieldValue } = require('./src/services/firebase');
const { ingestEnvironmentalTriggerSnapshot, processTriggerDocument } = require('./src/services/triggerEngine');
const { COLLECTIONS, appendAuditLog, toPlainDoc } = require('./src/services/store');
const { logError, logInfo } = require('./src/services/logger');

function schedulerAuthorized(req) {
  const expected = process.env.SCHEDULER_SHARED_SECRET;
  if (!expected) {
    return true;
  }

  return req.get('x-autoshield-scheduler-secret') === expected;
}

exports.api = onRequest({
  cors: true,
  maxInstances: Number(process.env.API_MAX_INSTANCES || 40),
  concurrency: Number(process.env.API_CONCURRENCY || 80)
}, app);

exports.ingestDisruptionSnapshot = onRequest({
  cors: false,
  maxInstances: Number(process.env.SCHEDULER_MAX_INSTANCES || 10),
  concurrency: 8
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!schedulerAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized scheduler invocation' });
  }

  try {
    const schedulerRunId = req.body?.schedulerRunId || `${Date.now()}`;
    const result = await ingestEnvironmentalTriggerSnapshot({
      source: 'cloud-scheduler-http',
      schedulerRunId,
      zone: req.body?.zone || 'semi-urban'
    });

    return res.json({ accepted: true, result });
  } catch (error) {
    logError('Scheduler ingestion failed', error);
    await appendAuditLog({
      type: 'scheduler_ingestion_failure',
      metadata: {
        message: error.message
      }
    });
    return res.status(500).json({ error: error.message });
  }
});

exports.runTriggerEvaluator = onSchedule('every 5 minutes', async () => {
  const schedulerRunId = `${Date.now()}`;
  await ingestEnvironmentalTriggerSnapshot({
    source: 'cloud-scheduler-cron',
    schedulerRunId
  });
});

exports.onTriggerCreated = onDocumentCreated('triggers/{triggerId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot?.exists) {
    return;
  }

  const triggerDoc = toPlainDoc(snapshot);
  if (!triggerDoc) {
    return;
  }

  try {
    const outcome = await processTriggerDocument(triggerDoc, {
      requestMeta: {
        source: 'firestore-oncreate'
      }
    });

    logInfo('Trigger processing completed', {
      triggerId: triggerDoc.id,
      triggered: outcome.triggered,
      claims: outcome.claims?.length || 0
    });
  } catch (error) {
    logError('Trigger processing failed', error, { triggerId: triggerDoc.id });
    await db.collection(COLLECTIONS.systemHealth).doc('ai').set({
      status: 'degraded',
      lastError: error.message,
      lastFailedTriggerId: triggerDoc.id,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    await appendAuditLog({
      type: 'trigger_processing_failure',
      metadata: {
        triggerId: triggerDoc.id,
        message: error.message
      }
    });
  }
});