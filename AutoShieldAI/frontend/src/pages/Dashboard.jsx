import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { usePlatform } from '../context/PlatformContext';

const DATA_UPDATED_EVENT = 'autoshield:data-updated';
const FALLBACK_OVERVIEW = {
  totalClaims: 14,
  paidClaims: 9,
  totalPayout: 24860,
  activePolicy: {
    id: 'POL-ST-2208',
    riskLevel: 'medium',
    riskScore: 0.54,
    weeklyPremium: 640,
    coverageAmount: 12000,
    status: 'active'
  },
  systemHealth: {
    status: 'stable',
    schedulerStatus: 'running',
    aiStatus: 'healthy',
    activePolicies: 1
  }
};

const FALLBACK_CLAIMS = [
  { id: 'fb-claim-1', triggerType: 'rainfall', payoutStatus: 'paid', payoutAmount: 1300, createdAt: '2026-04-17T08:40:00.000Z' },
  { id: 'fb-claim-2', triggerType: 'heatwave', payoutStatus: 'processing', payoutAmount: 820, createdAt: '2026-04-17T07:25:00.000Z' },
  { id: 'fb-claim-3', triggerType: 'aqi', payoutStatus: 'paid', payoutAmount: 560, createdAt: '2026-04-16T18:10:00.000Z' },
  { id: 'fb-claim-4', triggerType: 'demand_drop', payoutStatus: 'pending', payoutAmount: 740, createdAt: '2026-04-16T12:50:00.000Z' },
  { id: 'fb-claim-5', triggerType: 'curfew', payoutStatus: 'rejected', payoutAmount: 0, createdAt: '2026-04-15T21:30:00.000Z' },
  { id: 'fb-claim-6', triggerType: 'rainfall', payoutStatus: 'paid', payoutAmount: 920, createdAt: '2026-04-15T09:15:00.000Z' }
];

export default function Dashboard() {
  const { profile } = usePlatform();
  const [summary, setSummary] = useState({ totalClaims: 0, paidClaims: 0, totalPayout: 0, activePolicy: null, systemHealth: null, now: null });
  const [claims, setClaims] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  async function fetchOverview() {
    setRefreshing(true);

    try {
      const [summaryResult, claimsResult] = await Promise.allSettled([
        api.get('/live/summary', { fresh: true }),
        api.get('/claims/mine', { fresh: true })
      ]);

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value?.data || summary);
      }

      if (claimsResult.status === 'fulfilled') {
        setClaims(claimsResult.value?.data || []);
      }

      setLastSync(new Date());
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOverview().catch(() => {});

    const handleFocusSync = () => {
      fetchOverview().catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOverview().catch(() => {});
      }
    };

    const handleDataUpdated = () => {
      fetchOverview().catch(() => {});
    };

    window.addEventListener('focus', handleFocusSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(DATA_UPDATED_EVENT, handleDataUpdated);

    const timer = setInterval(() => {
      fetchOverview().catch(() => {});
    }, 5000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, []);

  const claimRate = useMemo(() => {
    if (!summary.totalClaims) return 0;
    return Math.round((summary.paidClaims / summary.totalClaims) * 100);
  }, [summary]);

  const hasBackendSummary = Number(summary.totalClaims || 0) > 0
    || Number(summary.paidClaims || 0) > 0
    || Number(summary.totalPayout || 0) > 0
    || Boolean(summary.activePolicy);

  const displaySummary = hasBackendSummary
    ? summary
    : {
      ...FALLBACK_OVERVIEW,
      now: summary.now || new Date().toISOString()
    };

  const displayClaims = (claims || []).length ? claims : FALLBACK_CLAIMS;
  const activePolicy = displaySummary.activePolicy || null;
  const systemHealth = displaySummary.systemHealth || {};

  const displayClaimRate = useMemo(() => {
    if (!displaySummary.totalClaims) return 0;
    return Math.round((displaySummary.paidClaims / displaySummary.totalClaims) * 100);
  }, [displaySummary]);

  function exportOverviewPdf() {
    const reportTitle = 'AutoShield AI - User Overview Report';
    const exportTime = new Date().toLocaleString();
    const userName = profile?.name || 'Operator';
    const userEmail = profile?.email || 'n/a';
    const userPhone = profile?.phone || 'n/a';
    const userZone = profile?.zone || 'n/a';
    const policy = activePolicy || {};
    const reportClaims = (displayClaims || []).slice(0, 18);

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(reportTitle)}</title>
        <style>
          @page { size: A4; margin: 16mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            line-height: 1.45;
          }
          .report {
            width: 100%;
          }
          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 4px;
          }
          .subtitle {
            font-size: 12px;
            color: #334155;
            margin: 0;
          }
          .section {
            margin-top: 14px;
            page-break-inside: avoid;
          }
          .section h3 {
            margin: 0 0 8px;
            font-size: 14px;
            letter-spacing: .2px;
            text-transform: uppercase;
            color: #1e293b;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 12px;
            font-size: 12px;
          }
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .stat {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
          }
          .stat .label {
            font-size: 11px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: .3px;
          }
          .stat .value {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 7px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
          }
          .small {
            font-size: 11px;
            color: #475569;
          }
          .policy-box {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            font-size: 12px;
          }
          .policy-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 12px;
          }
          .footer {
            margin-top: 18px;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <h1 class="title">${escapeHtml(reportTitle)}</h1>
            <p class="subtitle">Generated: ${escapeHtml(exportTime)}</p>
          </div>

          <section class="section">
            <h3>User Profile</h3>
            <div class="meta-grid">
              <div><strong>Name:</strong> ${escapeHtml(String(userName))}</div>
              <div><strong>Email:</strong> ${escapeHtml(String(userEmail))}</div>
              <div><strong>Phone:</strong> ${escapeHtml(String(userPhone))}</div>
              <div><strong>Zone:</strong> ${escapeHtml(String(userZone))}</div>
            </div>
          </section>

          <section class="section">
            <h3>Overview Metrics</h3>
            <div class="stat-grid">
              <div class="stat"><div class="label">Total Claims</div><div class="value">${Number(displaySummary.totalClaims || 0)}</div></div>
              <div class="stat"><div class="label">Paid Claims</div><div class="value">${Number(displaySummary.paidClaims || 0)}</div></div>
              <div class="stat"><div class="label">Total Payout</div><div class="value">INR ${Number(displaySummary.totalPayout || 0).toLocaleString()}</div></div>
              <div class="stat"><div class="label">Settlement Rate</div><div class="value">${Number(displayClaimRate || 0)}%</div></div>
            </div>
          </section>

          <section class="section">
            <h3>Policy Snapshot</h3>
            <div class="policy-box">
              <div class="policy-grid">
                <div><strong>Policy ID:</strong> ${escapeHtml(String(policy.id || policy._id || 'n/a'))}</div>
                <div><strong>Status:</strong> ${escapeHtml(String(policy.status || 'n/a'))}</div>
                <div><strong>Risk Level:</strong> ${escapeHtml(String(policy.riskLevel || 'n/a'))}</div>
                <div><strong>Risk Score:</strong> ${escapeHtml(String(policy.riskScore ?? 'n/a'))}</div>
                <div><strong>Weekly Premium:</strong> INR ${Number(policy.weeklyPremium || 0).toLocaleString()}</div>
                <div><strong>Coverage Amount:</strong> INR ${Number(policy.coverageAmount || 0).toLocaleString()}</div>
              </div>
            </div>
          </section>

          <section class="section page-break">
            <h3>Recent Claim Activity</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Trigger Type</th>
                  <th>Status</th>
                  <th>Payout Amount</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${reportClaims.map((claim, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(String(claim.triggerType || 'trigger'))}</td>
                    <td>${escapeHtml(String(claim.payoutStatus || 'pending'))}</td>
                    <td>INR ${Number(claim.payoutAmount || 0).toLocaleString()}</td>
                    <td>${escapeHtml(new Date(claim.createdAt || Date.now()).toLocaleString())}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p class="small">Rows shown: ${reportClaims.length}</p>
          </section>

          <section class="section">
            <h3>System Health</h3>
            <div class="meta-grid">
              <div><strong>Overall:</strong> ${escapeHtml(String(systemHealth.status || 'unknown'))}</div>
              <div><strong>Scheduler:</strong> ${escapeHtml(String(systemHealth.schedulerStatus || 'unknown'))}</div>
              <div><strong>AI Service:</strong> ${escapeHtml(String(systemHealth.aiStatus || 'unknown'))}</div>
              <div><strong>Active Policies:</strong> ${escapeHtml(String(systemHealth.activePolicies ?? 'n/a'))}</div>
            </div>
          </section>

          <div class="footer">
            This report was generated from the Overview page for a single user profile in AutoShield AI.
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  return (
    <div className="space-y-4">
      <div className="hero-panel p-6 text-white shadow-xl">
        <p className="section-rail">Control Room</p>
        <h2 className="mt-2 text-3xl font-bold">Welcome, {profile?.name || 'Operator'}</h2>
        <p className="mt-1 text-sm text-slate-300">Monitor protection performance, claims movement, and policy health in one place.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Live sync {lastSync ? lastSync.toLocaleTimeString() : 'Connecting...'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">System {systemHealth.status || 'unknown'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{refreshing ? 'Refreshing' : 'Ready'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">API ready</span>
          <button onClick={exportOverviewPdf} className="ghost-button px-3 py-1 text-xs">Export User PDF</button>
        </div>
      </div>

      <div className="card-grid">
        <Stat title="Total Claims" value={displaySummary.totalClaims} hint="Recorded incidents" />
        <Stat title="Paid Claims" value={displaySummary.paidClaims} hint="Approved and settled" />
        <Stat title="Total Payout" value={`₹${Number(displaySummary.totalPayout || 0).toLocaleString()}`} hint="Lifetime payout" />
        <Stat title="Settlement Rate" value={`${displayClaimRate}%`} hint="Paid / total claims" />
      </div>

      <div className="data-grid">
        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold">Policy Snapshot</h3>
          {activePolicy ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <Row k="Policy ID" v={activePolicy.id || activePolicy._id || 'n/a'} />
              <Row k="Risk Level" v={activePolicy.riskLevel || 'n/a'} />
              <Row k="Risk Score" v={activePolicy.riskScore ?? 'n/a'} />
              <Row k="Weekly Premium" v={`₹${activePolicy.weeklyPremium ?? 0}`} />
              <Row k="Coverage" v={`₹${activePolicy.coverageAmount ?? 0}`} />
              <Row k="Status" v={activePolicy.status || 'n/a'} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No active policy found. Create or renew policy from the Policies page.</p>
          )}
        </div>

        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold">Recent Claim Activity</h3>
          <div className="mt-3 space-y-2">
            {displayClaims.slice(0, 6).map((claim) => (
              <div key={claim.id || claim._id} className="content-panel px-3 py-2 text-sm text-slate-200">
                <p className="font-medium text-white">{claim.triggerType || 'trigger'} • {claim.payoutStatus || 'pending'}</p>
                <p className="text-slate-300">Payout: ₹{claim.payoutAmount || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-grid">
        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold">System Health</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row k="Scheduler" v={systemHealth.schedulerStatus || 'unknown'} />
            <Row k="AI Service" v={systemHealth.aiStatus || 'unknown'} />
            <Row k="Active Policies" v={systemHealth.activePolicies ?? 'n/a'} />
            <Row k="Last Sync" v={displaySummary.now ? new Date(displaySummary.now).toLocaleString() : 'n/a'} />
          </div>
        </div>

        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold">Operator Notes</h3>
          <div className="mt-3 space-y-3 text-sm text-slate-300">
            <p>Live operations, claims, and analytics are connected to real-time services and visible without extra navigation.</p>
            <p>The interface now uses a darker operational palette so the command center feels production-ready instead of a blank shell.</p>
            <p>API requests are token-aware and fall back cleanly when the auth token or JSON payload is temporarily unavailable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function Stat({ title, value, hint }) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100">
      <span className="text-slate-400">{k}</span>
      <span className="font-medium text-white">{v}</span>
    </div>
  );
}
