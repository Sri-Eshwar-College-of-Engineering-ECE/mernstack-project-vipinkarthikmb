import { useEffect, useState } from 'react';
import api from '../services/api';
import { usePlatform } from '../context/PlatformContext';

const DATA_UPDATED_EVENT = 'autoshield:data-updated';
const STATIC_MY_CLAIMS = [
  { id: 'st-m-1', triggerType: 'rainfall', payoutStatus: 'paid', payoutAmount: 1150, createdAt: '2026-04-17T08:20:00.000Z' },
  { id: 'st-m-2', triggerType: 'heatwave', payoutStatus: 'processing', payoutAmount: 780, createdAt: '2026-04-17T06:40:00.000Z' },
  { id: 'st-m-3', triggerType: 'demand_drop', payoutStatus: 'pending', payoutAmount: 640, createdAt: '2026-04-16T19:10:00.000Z' },
  { id: 'st-m-4', triggerType: 'aqi', payoutStatus: 'paid', payoutAmount: 520, createdAt: '2026-04-16T14:35:00.000Z' }
];

const STATIC_NETWORK_CLAIMS = [
  { id: 'st-n-1', triggerType: 'rainfall', payoutStatus: 'paid', payoutAmount: 1320, createdAt: '2026-04-17T08:10:00.000Z', user: { name: 'Ravi', phone: '9012345678' } },
  { id: 'st-n-2', triggerType: 'curfew', payoutStatus: 'rejected', payoutAmount: 0, createdAt: '2026-04-17T05:30:00.000Z', user: { name: 'Meena', phone: '9445566778' } },
  { id: 'st-n-3', triggerType: 'heatwave', payoutStatus: 'processing', payoutAmount: 860, createdAt: '2026-04-16T23:45:00.000Z', user: { name: 'Arjun', phone: '9988776655' } },
  { id: 'st-n-4', triggerType: 'aqi', payoutStatus: 'paid', payoutAmount: 590, createdAt: '2026-04-16T15:15:00.000Z', user: { name: 'Deepa', phone: '9876501234' } }
];

export default function ClaimsCenter() {
  const { t } = usePlatform();
  const [mine, setMine] = useState([]);
  const [allClaims, setAllClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [entry, setEntry] = useState({
    triggerType: 'rainfall',
    payoutStatus: 'pending',
    payoutAmount: '920'
  });

  async function fetchClaims() {
    await Promise.all([
      api.get('/claims/mine', { fresh: true }).then((r) => setMine(r.data || [])).catch(() => setMine([])),
      api.get('/claims/all', { fresh: true }).then((r) => setAllClaims(r.data || [])).catch(() => setAllClaims([]))
    ]);
    setLastSync(new Date());
    setLoading(false);
  }

  useEffect(() => {
    fetchClaims().catch(() => {});

    const handleDataUpdated = () => {
      fetchClaims().catch(() => {});
    };

    window.addEventListener(DATA_UPDATED_EVENT, handleDataUpdated);

    const timer = setInterval(() => {
      fetchClaims().catch(() => {});
    }, 10000);

    return () => {
      clearInterval(timer);
      window.removeEventListener(DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, []);

  const sourceMine = (mine || []).length ? mine : STATIC_MY_CLAIMS;
  const sourceAllClaims = (allClaims || []).length ? allClaims : STATIC_NETWORK_CLAIMS;

  const mergedMine = [...sourceMine]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 20);

  const mergedAll = [...sourceAllClaims]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 30);

  const filteredMine = filterByStatus(mergedMine, statusFilter);
  const filteredAll = filterByStatus(mergedAll, statusFilter);

  async function createRealtimeClaim() {
    try {
      await api.post('/claims/manual', {
        triggerType: entry.triggerType,
        payoutStatus: entry.payoutStatus,
        payoutAmount: Number(entry.payoutAmount || 0)
      });

      await fetchClaims();
      window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
      setMessage('Claim saved to database and synced.');
    } catch (error) {
      setMessage(error?.message || 'Database update failed. Please retry.');
    }
  }

  async function updateClaimStatus(claimId, status) {
    if (!claimId) return;

    try {
      await api.patch(`/claims/${claimId}/status`, {
        payoutStatus: status
      });
      await fetchClaims();
      window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
      setMessage(`Claim status updated to ${status}.`);
    } catch (error) {
      setMessage(error?.message || 'Unable to update claim status in database.');
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">{t('claimsLoading', 'Loading claims center...')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-rail">Claims Center</p>
            <h2 className="text-xl font-semibold text-white">{t('claimsTitle', 'Claims Center')}</h2>
            <p className="text-sm text-slate-300">{t('claimsSubtitle', 'Track personal claims, monitor payouts, and inspect ecosystem claim flow.')}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-auto px-3 py-2 text-sm"
            >
              <option value="all">{t('claimsAll', 'All')}</option>
              <option value="paid">{t('claimsPaid', 'Paid')}</option>
              <option value="pending">{t('claimsPending', 'Pending')}</option>
              <option value="rejected">{t('claimsRejected', 'Rejected')}</option>
            </select>
            <button onClick={() => fetchClaims()} className="ghost-button px-3 py-2 text-sm">
              {t('claimsRefresh', 'Refresh')}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">{t('dashboardLastSync', 'Last Sync')}: {lastSync ? lastSync.toLocaleTimeString() : 'n/a'} • {t('claimsAutoRefresh', 'Auto-refresh every 10s')}</p>
        {message && <p className="mt-2 text-xs text-teal-200">{message}</p>}
      </div>

      <div className="card-grid">
        <MiniStat title="My Claims" value={filteredMine.length} />
        <MiniStat title="Network Claims" value={filteredAll.length} />
        <MiniStat title="Pending Queue" value={filteredMine.filter((c) => ['pending', 'processing'].includes(String(c.payoutStatus || '').toLowerCase())).length} />
        <MiniStat title="Paid Volume" value={`₹${filteredMine.filter((c) => String(c.payoutStatus || '').toLowerCase() === 'paid').reduce((sum, c) => sum + Number(c.payoutAmount || 0), 0).toLocaleString()}`} />
      </div>

      <div className="data-grid">
        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">Realtime Claim Actions</h3>
          <p className="mt-1 text-sm text-slate-300">Create and update claims instantly. Changes appear in Claims, Policies, and Live Operations.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-slate-300">
              Trigger type
              <select value={entry.triggerType} onChange={(event) => setEntry((old) => ({ ...old, triggerType: event.target.value }))} className="input-field mt-1">
                <option value="rainfall">Rainfall</option>
                <option value="heatwave">Heatwave</option>
                <option value="aqi">AQI</option>
                <option value="demand_drop">Demand Drop</option>
                <option value="curfew">Curfew</option>
              </select>
            </label>
            <label className="text-xs text-slate-300">
              Initial status
              <select value={entry.payoutStatus} onChange={(event) => setEntry((old) => ({ ...old, payoutStatus: event.target.value }))} className="input-field mt-1">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="text-xs text-slate-300 sm:col-span-2">
              Payout amount
              <input value={entry.payoutAmount} onChange={(event) => setEntry((old) => ({ ...old, payoutAmount: event.target.value }))} className="input-field mt-1" />
            </label>
          </div>
          <button onClick={createRealtimeClaim} className="primary-button mt-3 px-4 py-2 text-sm">Create Realtime Claim</button>
        </div>

        <ClaimsList title={t('claimsMyClaims', 'My Claims')} claims={filteredMine} showUser={false} t={t} onUpdateStatus={updateClaimStatus} />
        <ClaimsList title={t('claimsRecentNetwork', 'Recent Network Claims')} claims={filteredAll} showUser t={t} onUpdateStatus={updateClaimStatus} />
      </div>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function filterByStatus(list, status) {
  if (status === 'all') return list || [];
  return (list || []).filter((item) => (item.payoutStatus || '').toLowerCase() === status);
}

function ClaimsList({ title, claims, showUser, t, onUpdateStatus }) {
  return (
    <div className="surface-panel p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
        {claims.map((claim) => (
          <div key={claim.id || claim._id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm reveal-up">
            <p className="font-semibold text-white">{claim.triggerType || 'trigger'} • {claim.payoutStatus || 'pending'}</p>
            {showUser && claim.user?.name && (
              <p className="text-slate-300">{t('claimsUser', 'User')}: {claim.user.name} ({claim.user.phone || 'n/a'})</p>
            )}
            <p className="text-slate-300">{t('claimsAmount', 'Amount')}: ₹{claim.payoutAmount || 0}</p>
            <p className="text-slate-400">{new Date(claim.createdAt || Date.now()).toLocaleString()}</p>
            <p className="text-xs text-slate-400">{t('claimsSlaRisk', 'SLA risk')}: {slaRisk(claim.createdAt, claim.payoutStatus)}</p>
            {(claim.payoutStatus || '').toLowerCase() !== 'paid' && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => onUpdateStatus(claim.id || claim._id, 'processing')} className="ghost-button px-2 py-1 text-xs">Processing</button>
                <button onClick={() => onUpdateStatus(claim.id || claim._id, 'paid')} className="ghost-button px-2 py-1 text-xs">Mark Paid</button>
                <button onClick={() => onUpdateStatus(claim.id || claim._id, 'rejected')} className="ghost-button px-2 py-1 text-xs">Reject</button>
              </div>
            )}
          </div>
        ))}
        {!claims.length && <p className="text-sm text-slate-400">{t('claimsNone', 'No claims found.')}</p>}
      </div>
    </div>
  );
}

function slaRisk(createdAt, payoutStatus) {
  if ((payoutStatus || '').toLowerCase() === 'paid') return 'cleared';
  const ageMin = Math.round((Date.now() - new Date(createdAt || Date.now()).getTime()) / 60000);
  if (ageMin > 60) return 'high';
  if (ageMin > 30) return 'medium';
  return 'low';
}
