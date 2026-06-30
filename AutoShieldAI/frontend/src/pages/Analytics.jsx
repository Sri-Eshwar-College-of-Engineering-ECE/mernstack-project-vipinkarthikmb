import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { usePlatform } from '../context/PlatformContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Analytics() {
  const { t } = usePlatform();
  const [claims, setClaims] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  async function fetchClaims() {
    const res = await api.get('/claims/mine').catch(() => ({ data: [] }));
    setClaims(res.data || []);
    setLastSync(new Date());
  }

  useEffect(() => {
    fetchClaims().catch(() => {});
    const timer = setInterval(() => {
      fetchClaims().catch(() => {});
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const bars = useMemo(() => {
    const values = DAYS.map((_, i) => {
      return claims.filter((c) => new Date(c.createdAt || Date.now()).getDay() === ((i + 1) % 7)).length;
    });
    const max = Math.max(...values, 1);
    return values.map((v, i) => ({ day: DAYS[i], value: v, width: `${Math.round((v / max) * 100)}%` }));
  }, [claims]);

  const paid = claims.filter((c) => c.payoutStatus === 'paid').length;
  const pending = claims.length - paid;

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5">
        <p className="section-rail">{t('navAnalytics', 'Analytics')}</p>
        <h2 className="text-xl font-semibold text-white">{t('navAnalytics', 'Analytics')}</h2>
        <p className="text-sm text-slate-300">{t('analyticsSubtitle', 'Operational insights covering payout trends, trigger patterns, and settlement behavior.')}</p>
        <p className="mt-2 text-xs text-slate-400">{t('dashboardLiveSync', 'Live sync')}: {lastSync ? lastSync.toLocaleTimeString() : t('dashboardConnecting', 'Connecting...')}</p>
      </div>

      <div className="card-grid">
        <Metric title={t('analyticsClaimsCount', 'Claims Count')} value={claims.length} />
        <Metric title={t('claimsPaid', 'Paid')} value={paid} />
        <Metric title={t('claimsPending', 'Pending')} value={pending} />
        <Metric title={t('analyticsApprovalRatio', 'Approval Ratio')} value={`${claims.length ? Math.round((paid / claims.length) * 100) : 0}%`} />
      </div>

      <div className="data-grid">
        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">{t('analyticsWeeklyIntensity', 'Weekly Claim Intensity (Live Data)')}</h3>
          <div className="mt-4 space-y-3">
            {bars.map((bar) => (
              <div key={bar.day} className="reveal-up">
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{bar.day}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-teal-600 transition-all duration-700" style={{ width: bar.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">{t('analyticsKeyInsights', 'Key Insights')}</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200">
            <li>{t('analyticsInsight1', 'High claim density appears during weather-linked disruption windows.')}</li>
            <li>{t('analyticsInsight2', 'Paid ratio improves when trigger classification is deterministic.')}</li>
            <li>{t('analyticsInsight3', 'Faster renewals reduce uninsured exposure between weekly cycles.')}</li>
            <li>{t('analyticsInsight4', 'Live monitoring shortens incident-response and payout decision latency.')}</li>
            <li>{t('analyticsInsight5', 'Realtime listeners remove manual polling for dashboard freshness.')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
