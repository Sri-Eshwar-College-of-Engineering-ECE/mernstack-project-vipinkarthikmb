import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { usePlatform } from '../context/PlatformContext';

const DATA_UPDATED_EVENT = 'autoshield:data-updated';
const STATIC_TRIGGERS = [
  { id: 'lt-1', triggerType: 'rainfall', triggerValue: 72, processingStatus: 'processed', createdAt: '2026-04-17T08:25:00.000Z' },
  { id: 'lt-2', triggerType: 'heatwave', triggerValue: 44, processingStatus: 'pending', createdAt: '2026-04-17T06:05:00.000Z' },
  { id: 'lt-3', triggerType: 'aqi', triggerValue: 162, processingStatus: 'processed', createdAt: '2026-04-16T22:00:00.000Z' }
];

const STATIC_CLAIMS = [
  { id: 'lc-1', payoutStatus: 'processing', payoutAmount: 920 },
  { id: 'lc-2', payoutStatus: 'pending', payoutAmount: 640 },
  { id: 'lc-3', payoutStatus: 'paid', payoutAmount: 1180 }
];

const STATIC_FRAUD = [
  { id: 'lf-1', score: 71, riskBand: 'elevated', reasons: ['rapid-trigger-repeat', 'location-variance'] },
  { id: 'lf-2', score: 58, riskBand: 'watch', reasons: ['off-hours-pattern'] },
  { id: 'lf-3', score: 82, riskBand: 'high', reasons: ['identity-signal-mismatch', 'device-anomaly'] }
];

const STATIC_PAYOUTS = [
  { id: 'lp-1', amount: 1180 },
  { id: 'lp-2', amount: 920 },
  { id: 'lp-3', amount: 560 }
];

const STATIC_POLICIES = [
  { id: 'lpo-1', weeklyPremium: 640 },
  { id: 'lpo-2', weeklyPremium: 780 },
  { id: 'lpo-3', weeklyPremium: 600 }
];

export default function LiveOperations() {
  const { t } = usePlatform();
  const [claims, setClaims] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [scheduler, setScheduler] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const [liveAction, setLiveAction] = useState({ triggerType: 'rainfall', triggerValue: '64' });
  const [message, setMessage] = useState('');

  async function fetchLiveData() {
    try {
      const [streamResult, summaryResult] = await Promise.all([
        api.get('/live/stream', { fresh: true }),
        api.get('/live/summary', { fresh: true })
      ]);

      const stream = streamResult?.data || {};
      setClaims(stream.claims || []);
      setTriggers(stream.triggers || []);
      setFraudLogs(stream.fraudLogs || []);
      setPayouts(stream.payouts || []);
      setPolicies(stream.policies || []);

      const summary = summaryResult?.data || {};
      const health = summary.systemHealth || {};
      setScheduler({
        status: health.schedulerStatus || 'unknown',
        lastExecution: summary.now || null
      });
      setAiHealth({
        status: health.aiStatus || 'unknown',
        lastProcessedAt: summary.now || null
      });

      setConnectionState('connected');
    } catch {
      setConnectionState('reconnecting');
    }
  }

  useEffect(() => {
    fetchLiveData().catch(() => {});

    const timer = setInterval(() => {
      fetchLiveData().catch(() => {});
    }, 5000);

    const onDataUpdated = () => {
      fetchLiveData().catch(() => {});
    };

    window.addEventListener(DATA_UPDATED_EVENT, onDataUpdated);

    return () => {
      clearInterval(timer);
      window.removeEventListener(DATA_UPDATED_EVENT, onDataUpdated);
      setConnectionState('disconnected');
    };
  }, []);

  const totalPremiums = useMemo(() => policies.reduce((sum, policy) => sum + Number(policy.weeklyPremium || 0), 0), [policies]);
  const totalPayouts = useMemo(() => payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0), [payouts]);
  const lossRatio = useMemo(() => (totalPremiums > 0 ? totalPayouts / totalPremiums : 0), [totalPremiums, totalPayouts]);
  const activePayoutQueue = useMemo(() => claims.filter((claim) => claim.payoutStatus === 'processing' || claim.payoutStatus === 'pending').length, [claims]);

  const displayTriggers = triggers.length ? triggers : STATIC_TRIGGERS;
  const displayClaims = claims.length ? claims : STATIC_CLAIMS;
  const displayFraudLogs = fraudLogs.length ? fraudLogs : STATIC_FRAUD;
  const displayPayouts = payouts.length ? payouts : STATIC_PAYOUTS;
  const displayPolicies = policies.length ? policies : STATIC_POLICIES;

  const displayTotalPremiums = useMemo(() => displayPolicies.reduce((sum, policy) => sum + Number(policy.weeklyPremium || 0), 0), [displayPolicies]);
  const displayTotalPayouts = useMemo(() => displayPayouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0), [displayPayouts]);
  const displayLossRatio = useMemo(() => (displayTotalPremiums > 0 ? displayTotalPayouts / displayTotalPremiums : 0), [displayTotalPremiums, displayTotalPayouts]);
  const displayActiveQueue = useMemo(() => displayClaims.filter((claim) => claim.payoutStatus === 'processing' || claim.payoutStatus === 'pending').length, [displayClaims]);

  const incidents = useMemo(() => {
    return displayTriggers.slice(0, 12).map((trigger) => ({
      id: trigger.id,
      type: trigger.triggerType || 'none',
      value: trigger.triggerValue,
      status: trigger.processingStatus || 'pending',
      when: new Date(trigger.createdAt || Date.now())
    }));
  }, [displayTriggers]);

  async function injectRealtimeDisruption() {
    setMessage('');
    try {
      await api.post('/live/inject', {
        triggerType: liveAction.triggerType,
        triggerValue: Number(liveAction.triggerValue || 0)
      });
      await fetchLiveData();
      window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
      setMessage('Live event injected and stored in database.');
    } catch (error) {
      setMessage(error?.message || 'Unable to inject event right now.');
    }
  }

  async function resolveNextQueueItem(status) {
    setMessage('');
    try {
      await api.patch('/live/queue/next', { status });
      await fetchLiveData();
      window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
      setMessage(`Next queue item updated to ${status}.`);
    } catch (error) {
      setMessage(error?.message || 'Unable to update payout queue.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-rail">{t('navLiveOps', 'Live Operations')}</p>
            <h2 className="text-xl font-semibold text-white">{t('liveOpsTitle', 'Live Operations Center')}</h2>
            <p className="text-sm text-slate-300">{t('liveOpsSubtitle', 'Realtime disruption stream, fraud alerts, payout queue, and production health.')}</p>
          </div>
          <ConnectionPill state={connectionState} t={t} />
        </div>
        <p className="mt-2 text-xs text-slate-400">{t('liveOpsLastScheduler', 'Last scheduler execution')}: {formatTime(scheduler?.lastExecution)}</p>
        {message && <p className="mt-2 text-xs text-teal-200">{message}</p>}
      </div>

      <div className="card-grid">
        <LiveStat title={t('liveOpsDisruptions', 'Live Disruptions')} value={displayTriggers.length} subtitle={t('liveOpsRecentTriggers', 'Recent trigger records')} />
        <LiveStat title={t('liveOpsFraudAlerts', 'Fraud Alerts')} value={displayFraudLogs.filter((entry) => Number(entry.score || 0) >= 65).length} subtitle={t('liveOpsFraudThreshold', 'Score >= 65')} />
        <LiveStat title={t('liveOpsPayoutQueue', 'Active Payout Queue')} value={displayActiveQueue} subtitle={t('liveOpsClaimsProcessing', 'Claims in processing')} />
        <LiveStat title={t('liveOpsLossRatio', 'Loss Ratio')} value={displayLossRatio.toFixed(3)} subtitle={t('liveOpsLossFormula', 'TotalPayouts / TotalPremiums')} />
      </div>

      <div className="surface-panel p-5">
        <h3 className="text-lg font-semibold text-white">Realtime Actions</h3>
        <p className="mt-1 text-sm text-slate-300">Inject live disruptions and instantly update payout queue status.</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-300">
            Trigger
            <select value={liveAction.triggerType} onChange={(event) => setLiveAction((old) => ({ ...old, triggerType: event.target.value }))} className="input-field mt-1">
              <option value="rainfall">Rainfall</option>
              <option value="heatwave">Heatwave</option>
              <option value="aqi">AQI</option>
              <option value="demand_drop">Demand Drop</option>
              <option value="curfew">Curfew</option>
            </select>
          </label>
          <label className="text-xs text-slate-300">
            Trigger value
            <input value={liveAction.triggerValue} onChange={(event) => setLiveAction((old) => ({ ...old, triggerValue: event.target.value }))} className="input-field mt-1" />
          </label>
          <button onClick={injectRealtimeDisruption} className="primary-button px-4 py-2 text-sm">Inject Event</button>
          <button onClick={() => resolveNextQueueItem('paid')} className="ghost-button px-4 py-2 text-sm">Settle Next</button>
          <button onClick={() => resolveNextQueueItem('rejected')} className="ghost-button px-4 py-2 text-sm">Reject Next</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">{t('liveOpsStream', 'Live Disruption Stream')}</h3>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
            {incidents.map((incident) => (
              <div key={incident.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <p className="font-semibold text-white">{incident.type} • {incident.status}</p>
                <p className="text-slate-300">{t('liveOpsValue', 'Value')}: {incident.value ?? 'n/a'}</p>
                <p className="text-xs text-slate-400">{incident.when.toLocaleString()}</p>
              </div>
            ))}
            {!incidents.length && <p className="text-sm text-slate-400">{t('liveOpsNoDisruptions', 'No disruptions received yet.')}</p>}
          </div>
        </div>

        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">{t('dashboardSystemHealth', 'System Health')}</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Health label={t('dashboardScheduler', 'Scheduler')} value={scheduler?.status || 'unknown'} />
            <Health label={t('dashboardAiService', 'AI Service')} value={aiHealth?.status || 'unknown'} />
            <Health label={t('liveOpsAiProcessed', 'AI last processed')} value={formatTime(aiHealth?.lastProcessedAt)} />
            <Health label={t('liveOpsTotalPremiums', 'Total premiums')} value={`₹${displayTotalPremiums.toLocaleString()}`} />
            <Health label={t('liveOpsTotalPayouts', 'Total payouts')} value={`₹${displayTotalPayouts.toLocaleString()}`} />
          </div>

          <h4 className="mt-4 text-sm font-semibold text-white">{t('liveOpsFraudAlerts', 'Fraud Alerts')}</h4>
          <div className="mt-2 max-h-[180px] space-y-2 overflow-auto pr-1 text-xs">
            {displayFraudLogs.slice(0, 8).map((entry) => (
              <div key={entry.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <p className="font-semibold text-white">{t('liveOpsScore', 'Score')} {entry.score} • {entry.riskBand || 'unknown'}</p>
                <p className="text-slate-300">{Array.isArray(entry.reasons) ? entry.reasons.join('; ') : t('liveOpsNoReasons', 'No reasons')}</p>
              </div>
            ))}
            {!displayFraudLogs.length && <p className="text-slate-400">{t('liveOpsNoFraudAlerts', 'No fraud alerts yet.')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(value) {
  if (!value) return 'n/a';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'n/a';
  return parsed.toLocaleString();
}

function ConnectionPill({ state, t }) {
  const stateMap = {
    connected: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    reconnecting: 'bg-amber-100 text-amber-700 border-amber-200',
    disconnected: 'bg-rose-100 text-rose-700 border-rose-200',
    connecting: 'bg-sky-100 text-sky-700 border-sky-200'
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${stateMap[state] || stateMap.connecting}`}>
      {t(`liveOpsState${state}`, state)}
    </span>
  );
}

function LiveStat({ title, value, subtitle }) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

function Health({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
