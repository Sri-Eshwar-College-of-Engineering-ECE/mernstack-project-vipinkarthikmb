import { Link } from 'react-router-dom';

const VALUE_PROPS = [
  'AI-powered premium pricing using weather and demand signals',
  'Auto-generated claims during disruptions with zero manual paperwork',
  'Centralized workflow and analytics for operators and support teams',
  'Live operations center with auto-refreshing incidents and SLA risk indicators'
];

const CAPABILITIES = [
  {
    title: 'Realtime Trigger Fabric',
    description: 'Weather, AQI, curfew, and demand changes are ingested continuously and converted into operational events.',
    badge: 'Live stream'
  },
  {
    title: 'Autonomous Claims',
    description: 'Every verified trigger creates a payout decision path with fraud scoring and reserve-aware disbursement logic.',
    badge: 'Zero-touch'
  },
  {
    title: 'Operational Visibility',
    description: 'Claims queue, system health, fraud alerts, and loss ratio are displayed in one command center.',
    badge: 'Control room'
  },
  {
    title: 'Adaptive Pricing Loop',
    description: 'The premium model adapts to zone risk and disruption frequency, reducing uninsured downtime for workers.',
    badge: 'AI loop'
  }
];

const TIMELINE = [
  { title: 'Signal detected', detail: 'External data snapshot enters trigger evaluator and maps to threshold rules.' },
  { title: 'Risk + fraud scoring', detail: 'AI risk and fraud engines score exposure before payout release.' },
  { title: 'Claim decision', detail: 'Payout status is committed with audit entries for operational review.' },
  { title: 'Live dashboard update', detail: 'Firestore listeners refresh operations views without manual polling.' },
  { title: 'Model feedback loop', detail: 'Outcomes feed analytics and premium strategy for next cycle.' }
];

const KPI_STRIP = [
  { label: 'Claim trigger latency', value: '< 5 min' },
  { label: 'Queue visibility', value: 'Realtime' },
  { label: 'Fraud triage', value: 'AI assisted' },
  { label: 'Policy lifecycle', value: 'Weekly adaptive' }
];

export default function Landing() {
  return (
    <div className="min-h-screen px-4 py-6 text-slate-100 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6">
        <header className="surface-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-amber-300 text-slate-900 font-black shadow-lg">AS</div>
            <div>
              <p className="section-rail">AutoShield AI</p>
              <p className="text-lg font-semibold text-white">Live protection for gig income</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/login" className="ghost-button px-4 py-2 text-sm">Login</Link>
            <Link to="/register" className="primary-button px-5 py-2 text-sm">Get Started</Link>
          </div>
        </header>

        <section className="grid items-center gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="hero-panel p-6 lg:p-8 landing-hero">
            <p className="section-rail">Realtime insurance intelligence</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white lg:text-6xl">
              Keep riders, couriers, and operators covered when disruption hits.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
              AutoShield AI links live weather, demand, and AQI signals to claim automation, premium recalculation, and operations visibility in a single production-style control plane.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="primary-button px-6 py-3 text-sm">Create Account</Link>
              <Link to="/login" className="ghost-button px-6 py-3 text-sm">Open Operations</Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {VALUE_PROPS.map((item) => (
                <div key={item} className="content-panel landing-card px-4 py-3 text-sm text-slate-200 reveal-up">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel-strong p-5 landing-orbital">
            <p className="section-rail">What is displayed</p>
            <div className="mt-4 space-y-3">
              <Metric title="Realtime feed" value="Live" caption="Streaming claims and operations updates" />
              <Metric title="Automation" value="Zero-touch" caption="Claims and policy renewal flows trigger from backend signals" />
              <Metric title="Risk engine" value="AI scored" caption="Premium and fraud signals stay visible to the team" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="stat-card px-3 py-4">
                <p className="text-lg font-bold text-teal-200">Live</p>
                <p className="text-slate-400">events</p>
              </div>
              <div className="stat-card px-3 py-4">
                <p className="text-lg font-bold text-amber-200">Fast</p>
                <p className="text-slate-400">settlements</p>
              </div>
              <div className="stat-card px-3 py-4">
                <p className="text-lg font-bold text-sky-200">AI</p>
                <p className="text-slate-400">pricing</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-panel px-5 py-5 lg:px-7">
          <p className="section-rail">Operational KPIs</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {KPI_STRIP.map((kpi) => (
              <div key={kpi.label} className="status-card landing-card px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{kpi.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="surface-panel p-6">
            <p className="section-rail">Capabilities</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Built for real-time insurance operations</h2>
            <div className="mt-5 grid gap-3">
              {CAPABILITIES.map((capability) => (
                <article key={capability.title} className="content-panel landing-card px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-white">{capability.title}</h3>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">{capability.badge}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{capability.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="surface-panel-strong p-6">
            <p className="section-rail">Income protection journey</p>
            <h2 className="mt-2 text-2xl font-bold text-white">From disruption signal to payout insight</h2>
            <div className="timeline mt-5">
              {TIMELINE.map((step, index) => (
                <div key={step.title} className="timeline-item reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="timeline-node">{index + 1}</div>
                  <div className="timeline-panel">
                    <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel px-6 py-7 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="section-rail">Platform ready</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Explore the full realtime platform now</h2>
              <p className="mt-2 max-w-2xl text-slate-300">
                Open dashboard, claims center, live ops, analytics, and workflow modules in one continuous full-screen app shell.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="primary-button px-6 py-3 text-sm">Login To Platform</Link>
              <Link to="/register" className="ghost-button px-6 py-3 text-sm">Register New Worker</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ title, value, caption }) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{caption}</p>
    </div>
  );
}
