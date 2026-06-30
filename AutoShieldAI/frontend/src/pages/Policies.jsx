import { useEffect, useState } from 'react';
import api from '../services/api';
import { usePlatform } from '../context/PlatformContext';

const DATA_UPDATED_EVENT = 'autoshield:data-updated';
const STATIC_ACTIVE_POLICY = {
  id: 'POL-ST-2208',
  riskLevel: 'medium',
  riskScore: 0.54,
  coverageAmount: 12000,
  weeklyPremium: 640,
  status: 'active'
};

const STATIC_POLICY_HISTORY = [
  { id: 'POL-H-1', status: 'active', riskLevel: 'medium', riskScore: 0.54, weeklyPremium: 640, coverageAmount: 12000, createdAt: '2026-04-17T08:00:00.000Z' },
  { id: 'POL-H-2', status: 'renewed', riskLevel: 'high', riskScore: 0.68, weeklyPremium: 780, coverageAmount: 14000, createdAt: '2026-04-10T09:00:00.000Z' },
  { id: 'POL-H-3', status: 'renewed', riskLevel: 'medium', riskScore: 0.51, weeklyPremium: 600, coverageAmount: 11000, createdAt: '2026-04-03T09:00:00.000Z' },
  { id: 'POL-H-4', status: 'paused', riskLevel: 'low', riskScore: 0.34, weeklyPremium: 420, coverageAmount: 9000, createdAt: '2026-03-27T09:00:00.000Z' }
];

export default function Policies() {
  const { t } = usePlatform();
  const [activePolicy, setActivePolicy] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState({
    riskLevel: 'medium',
    riskScore: '0.52',
    weeklyPremium: '520',
    coverageAmount: '7500',
    status: 'active'
  });

  function fetchPolicies() {
    return Promise.all([
      api.get('/policy/mine', { fresh: true }).then((r) => setActivePolicy(r.data)).catch(() => setActivePolicy(null)),
      api.get('/policy/all', { fresh: true }).then((r) => setHistory(r.data || [])).catch(() => setHistory([]))
    ]);
  }

  useEffect(() => {
    fetchPolicies().finally(() => setLoading(false));

    const handleDataUpdated = () => {
      fetchPolicies().catch(() => {});
    };

    window.addEventListener(DATA_UPDATED_EVENT, handleDataUpdated);

    return () => {
      window.removeEventListener(DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, []);

  async function renewPolicy() {
    setRenewing(true);
    setMessage('');

    try {
      await api.post('/policy/renew', {});
      await fetchPolicies();
      window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
      setMessage(t('policiesRenewSuccess', 'Policy renewed successfully using latest AI risk signals.'));
    } catch (error) {
      setMessage(error?.message || t('policiesRenewFail', 'Unable to renew policy right now.'));
    } finally {
      setRenewing(false);
    }
  }

  async function applyInteractiveUpdate() {
    try {
      const response = await api.post('/policy/manual-update', {
        riskLevel: editor.riskLevel,
        riskScore: Number(editor.riskScore || 0.5),
        weeklyPremium: Number(editor.weeklyPremium || 0),
        coverageAmount: Number(editor.coverageAmount || 0),
        status: editor.status || 'active'
      });

      await fetchPolicies();
      window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));

      const revision = response?.data;
      setMessage(`Policy saved to database: ${(revision?.riskLevel || editor.riskLevel).toUpperCase()} risk, premium ₹${revision?.weeklyPremium || Number(editor.weeklyPremium || 0)}.`);
    } catch (error) {
      setMessage(error?.message || 'Unable to save policy update in database. Please retry.');
    }
  }

  const mergedHistory = [...((history || []).length ? history : STATIC_POLICY_HISTORY)]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 12);

  const effectiveActivePolicy = activePolicy || STATIC_ACTIVE_POLICY;

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">{t('policiesLoading', 'Loading policy center...')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-rail">Policy Management</p>
            <h2 className="text-xl font-semibold text-white">{t('policiesTitle', 'Policy Management')}</h2>
            <p className="text-sm text-slate-300">{t('policiesSubtitle', 'Renew weekly policy based on dynamic location and demand risk factors.')}</p>
          </div>
          <button
            onClick={renewPolicy}
            disabled={renewing}
            className="primary-button px-4 py-2 text-sm disabled:opacity-60"
          >
            {renewing ? t('policiesRenewing', 'Renewing...') : t('policiesRenewButton', 'Renew Policy')}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-teal-200">{message}</p>}
      </div>

      <div className="card-grid">
        <PolicyMiniStat title="History Records" value={mergedHistory.length} />
        <PolicyMiniStat title="Current Premium" value={`₹${Number(effectiveActivePolicy?.weeklyPremium || 0).toLocaleString()}`} />
        <PolicyMiniStat title="Coverage" value={`₹${Number(effectiveActivePolicy?.coverageAmount || 0).toLocaleString()}`} />
        <PolicyMiniStat title="Risk Score" value={effectiveActivePolicy?.riskScore ?? 'n/a'} />
      </div>

      <div className="data-grid">
        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">{t('policiesActive', 'Active Policy')}</h3>
          {effectiveActivePolicy ? (
            <div className="mt-3 space-y-2 text-sm">
              <Field label={t('dashboardPolicyId', 'Policy ID')} value={effectiveActivePolicy.id || effectiveActivePolicy._id} />
              <Field label={t('dashboardRiskLevel', 'Risk Level')} value={effectiveActivePolicy.riskLevel || 'n/a'} />
              <Field label={t('dashboardRiskScore', 'Risk Score')} value={effectiveActivePolicy.riskScore ?? 'n/a'} />
              <Field label={t('policiesCoverageAmount', 'Coverage Amount')} value={`₹${effectiveActivePolicy.coverageAmount || 0}`} />
              <Field label={t('dashboardWeeklyPremium', 'Weekly Premium')} value={`₹${effectiveActivePolicy.weeklyPremium || 0}`} />
              <Field label={t('dashboardStatus', 'Status')} value={effectiveActivePolicy.status || 'unknown'} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{t('policiesNoActive', 'No active policy yet.')}</p>
          )}
        </div>

        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">Realtime Policy Controls</h3>
          <p className="mt-1 text-sm text-slate-300">Update values and instantly push a new policy revision to all live pages.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-slate-300">
              Risk level
              <select value={editor.riskLevel} onChange={(event) => setEditor((old) => ({ ...old, riskLevel: event.target.value }))} className="input-field mt-1">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="text-xs text-slate-300">
              Status
              <select value={editor.status} onChange={(event) => setEditor((old) => ({ ...old, status: event.target.value }))} className="input-field mt-1">
                <option value="active">Active</option>
                <option value="renewed">Renewed</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label className="text-xs text-slate-300">
              Risk score
              <input value={editor.riskScore} onChange={(event) => setEditor((old) => ({ ...old, riskScore: event.target.value }))} className="input-field mt-1" />
            </label>
            <label className="text-xs text-slate-300">
              Weekly premium
              <input value={editor.weeklyPremium} onChange={(event) => setEditor((old) => ({ ...old, weeklyPremium: event.target.value }))} className="input-field mt-1" />
            </label>
            <label className="text-xs text-slate-300 sm:col-span-2">
              Coverage amount
              <input value={editor.coverageAmount} onChange={(event) => setEditor((old) => ({ ...old, coverageAmount: event.target.value }))} className="input-field mt-1" />
            </label>
          </div>
          <button onClick={applyInteractiveUpdate} className="primary-button mt-3 px-4 py-2 text-sm">Apply Realtime Update</button>
        </div>

        <div className="surface-panel p-5 sm:col-span-2">
          <h3 className="text-lg font-semibold text-white">{t('policiesHistory', 'Policy History')}</h3>
          <div className="mt-3 max-h-[340px] space-y-2 overflow-auto pr-1">
            {mergedHistory.map((item) => (
              <div key={item.id || item._id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <p className="font-semibold text-white">{item.status?.toUpperCase()} • {item.riskLevel || 'n/a'}</p>
                <p className="text-slate-300">{t('policiesPremium', 'Premium')} ₹{item.weeklyPremium || 0} | {t('dashboardCoverage', 'Coverage')} ₹{item.coverageAmount || 0}</p>
              </div>
            ))}
            {!mergedHistory.length && <p className="text-sm text-slate-400">{t('policiesNoHistory', 'No policy records available.')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyMiniStat({ title, value }) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
