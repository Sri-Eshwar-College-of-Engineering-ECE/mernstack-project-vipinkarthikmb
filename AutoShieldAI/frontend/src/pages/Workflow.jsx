import { usePlatform } from '../context/PlatformContext';

const PHASES = [
  {
    titleKey: 'workflowPhase1Title',
    detailKey: 'workflowPhase1Detail',
    title: 'Onboarding',
    detail: 'Worker registers with profile details, zone, vehicle type, and income baseline.'
  },
  {
    titleKey: 'workflowPhase2Title',
    detailKey: 'workflowPhase2Detail',
    title: 'Risk Scoring',
    detail: 'AI service computes risk score and recommends weekly premium with transparency breakdown.'
  },
  {
    titleKey: 'workflowPhase3Title',
    detailKey: 'workflowPhase3Detail',
    title: 'Policy Activation',
    detail: 'Coverage starts with weekly lifecycle and renewable terms.'
  },
  {
    titleKey: 'workflowPhase4Title',
    detailKey: 'workflowPhase4Detail',
    title: 'Trigger Detection',
    detail: 'Rainfall, heat, AQI, demand collapse, and curfew events are evaluated continuously.'
  },
  {
    titleKey: 'workflowPhase5Title',
    detailKey: 'workflowPhase5Detail',
    title: 'Auto Claim Flow',
    detail: 'Claims are generated and routed through payout and fraud checks.'
  },
  {
    titleKey: 'workflowPhase6Title',
    detailKey: 'workflowPhase6Detail',
    title: 'Insight Loop',
    detail: 'Outcomes feed analytics, support operations, and premium model improvements.'
  }
];

export default function Workflow() {
  const { t } = usePlatform();

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5">
        <p className="section-rail">{t('workflowRail', 'Workflow Studio')}</p>
        <h2 className="text-xl font-semibold text-white">{t('workflowTitle', 'Workflow Studio')}</h2>
        <p className="text-sm text-slate-300">{t('workflowSubtitle', 'End-to-end process visibility from policy creation to claim settlement and feedback loops.')}</p>
      </div>

      <div className="surface-panel p-5">
        <div className="space-y-3">
          {PHASES.map((phase, idx) => (
            <div key={phase.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-slate-950">
                {idx + 1}
              </div>
              <div>
                <p className="font-semibold text-white">{t(phase.titleKey, phase.title)}</p>
                <p className="text-sm text-slate-300">{t(phase.detailKey, phase.detail)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-grid">
        <Panel title={t('workflowAutomationCoverage', 'Automation Coverage')} value="82%" caption={t('workflowAutomationCaption', 'System-handled events without manual intervention')} />
        <Panel title={t('workflowAverageTurnaround', 'Average Claim Turnaround')} value="4m 20s" caption={t('workflowTurnaroundCaption', 'From trigger detection to claim generation')} />
        <Panel title={t('workflowReliability', 'Workflow Reliability')} value="99.2%" caption={t('workflowReliabilityCaption', 'Stable execution in simulated disruption scenarios')} />
      </div>
    </div>
  );
}

function Panel({ title, value, caption }) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{caption}</p>
    </div>
  );
}
