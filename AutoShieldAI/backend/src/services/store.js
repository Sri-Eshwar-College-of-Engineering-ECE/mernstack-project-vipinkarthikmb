const { db, FieldValue } = require('./firebase');

const COLLECTIONS = {
  users: 'users',
  policies: 'policies',
  claims: 'claims',
  triggers: 'triggers',
  fraudLogs: 'fraud_logs',
  payouts: 'payouts',
  auditLogs: 'audit_logs',
  systemHealth: 'system_health',
  fraudAggregates: 'fraud_aggregates',
  payoutReserves: 'payout_reserves'
};

function sanitizeValue(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeValue(entry)]));
}

function toPlainDoc(snapshot) {
  if (!snapshot || !snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...sanitizeValue(snapshot.data())
  };
}

async function getUserProfile(uid) {
  const snapshot = await db.collection(COLLECTIONS.users).doc(uid).get();
  return toPlainDoc(snapshot);
}

async function upsertUserProfile(uid, payload) {
  const ref = db.collection(COLLECTIONS.users).doc(uid);
  const data = {
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: payload.createdAt || FieldValue.serverTimestamp()
  };

  await ref.set(data, { merge: true });
  return toPlainDoc(await ref.get());
}

async function appendAuditLog(entry) {
  const ref = await db.collection(COLLECTIONS.auditLogs).add({
    ...entry,
    createdAt: FieldValue.serverTimestamp()
  });

  return { id: ref.id, ...entry };
}

async function listCollection(collectionName, queryBuilder = (query) => query, limit = 20) {
  const baseQuery = queryBuilder(db.collection(collectionName));
  const snapshot = await baseQuery.limit(limit).get();
  return snapshot.docs.map(toPlainDoc).filter(Boolean);
}

module.exports = {
  COLLECTIONS,
  appendAuditLog,
  getUserProfile,
  listCollection,
  sanitizeValue,
  toPlainDoc,
  upsertUserProfile
};