const { db, FieldValue } = require('./firebase');
const { COLLECTIONS, appendAuditLog } = require('./store');

function computePayout({ policy, incomeLoss, severityMultiplier = 0.8 }) {
  const maxPayout = Number(policy.coverageAmount || 0) * 0.5;
  return Number(Math.min(incomeLoss * severityMultiplier, maxPayout).toFixed(2));
}

async function createPayoutRecord({ claim, profile, policy, reserveRatio = 0.2 }) {
  const payoutAmount = Number(claim.payoutAmount || 0);
  const reserveAmount = Number((payoutAmount * reserveRatio).toFixed(2));

  const payoutRef = await db.collection(COLLECTIONS.payouts).add({
    claimId: claim.id || null,
    userId: profile.uid,
    policyId: policy?.id || null,
    amount: payoutAmount,
    reserveAmount,
    status: 'paid',
    channel: 'wallet',
    payoutRef: `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await db.collection(COLLECTIONS.payoutReserves).doc('global').set({
    currentReserve: FieldValue.increment(-payoutAmount),
    totalPaidOut: FieldValue.increment(payoutAmount),
    totalReserveAllocated: FieldValue.increment(reserveAmount),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await appendAuditLog({
    type: 'payout_created',
    userId: profile.uid,
    policyId: policy?.id || null,
    claimId: claim.id || null,
    metadata: {
      amount: payoutAmount,
      reserveAmount,
      payoutId: payoutRef.id
    }
  });

  return {
    id: payoutRef.id,
    amount: payoutAmount,
    reserveAmount,
    status: 'paid'
  };
}

module.exports = {
  computePayout,
  createPayoutRecord
};