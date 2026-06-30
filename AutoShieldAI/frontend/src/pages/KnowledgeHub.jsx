import { usePlatform } from '../context/PlatformContext';

const FAQ = [
  {
    key: 'knowledgeFaq1',
    q: 'How does AutoShield AI decide premium?',
    a: 'Premium is calculated using zone, average earnings, climate stress factors, AQI, and expected demand drop.'
  },
  {
    key: 'knowledgeFaq2',
    q: 'How are claims created in real time?',
    a: 'Claims are created from disruption trigger events and then appear in the Live Operations and Claims Center feeds with automated refresh.'
  },
  {
    key: 'knowledgeFaq3',
    q: 'How often should policy be renewed?',
    a: 'Current implementation follows a weekly renewal cycle and recalculates risk each cycle.'
  },
  {
    key: 'knowledgeFaq4',
    q: 'What does Claims Center show?',
    a: 'It provides user-level claims and network-level recent claims for operations visibility.'
  }
];

const PLAYBOOKS = [
  'Severe rainfall event response for delivery fleets',
  'Heatwave claim surge response checklist',
  'Low-demand payout communication workflow',
  'Fraud anomaly escalation and review pattern',
  'Support scripts for first-time policyholders'
];

export default function KnowledgeHub() {
  const { t } = usePlatform();

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5">
        <p className="section-rail">{t('knowledgeRail', 'Knowledge Hub')}</p>
        <h2 className="text-xl font-semibold text-white">{t('knowledgeTitle', 'Knowledge Hub')}</h2>
        <p className="text-sm text-slate-300">{t('knowledgeSubtitle', 'Training material, implementation notes, and operational playbooks in one place.')}</p>
      </div>

      <div className="data-grid">
        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">{t('knowledgeFaqTitle', 'Frequently Asked Questions')}</h3>
          <div className="mt-4 space-y-2">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="font-semibold text-white">{t(`${item.key}Q`, item.q)}</p>
                <p className="mt-1 text-sm text-slate-300">{t(`${item.key}A`, item.a)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel p-5">
          <h3 className="text-lg font-semibold text-white">{t('knowledgePlaybooks', 'Operational Playbooks')}</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-200">
            {PLAYBOOKS.map((item) => (
              <li key={item}>{t(`knowledgePlaybook${PLAYBOOKS.indexOf(item) + 1}`, item)}</li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-teal-400/20 bg-teal-400/10 p-4 text-sm text-teal-50">
            {t('knowledgeTip', 'Tip: Use Live Operations board during reviews to show current queue state, SLA risk, and payout progress in real time.')}
          </div>
        </div>
      </div>
    </div>
  );
}
