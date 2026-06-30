import { Link, NavLink, Outlet } from 'react-router-dom';
import { usePlatform } from '../context/PlatformContext';

const NAV_ITEMS = [
  { to: '/app/overview', labelKey: 'navOverview' },
  { to: '/app/policies', labelKey: 'navPolicies' },
  { to: '/app/claims', labelKey: 'navClaims' },
  { to: '/app/live-ops', labelKey: 'navLiveOps' },
  { to: '/app/analytics', labelKey: 'navAnalytics' },
  { to: '/app/workflow', labelKey: 'navWorkflow' },
  { to: '/app/knowledge', labelKey: 'navKnowledge' },
  { to: '/app/settings', labelKey: 'navSettings' }
];

export default function AppShell() {
  const { profile, ui, locale, signOutUser, setAccessibility, setLocale, t } = usePlatform();
  const role = profile?.role || 'worker';

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (role === 'worker') {
      return item.to !== '/app/analytics';
    }

    if (role === 'ops_manager') {
      return item.to !== '/app/knowledge';
    }

    return true;
  });

  async function logout() {
    await signOutUser();
  }

  return (
    <div className={`full-screen-app app-shell flex w-full ${ui.colorBlindTheme ? 'theme-accessible' : ''} ${ui.largeFont ? 'large-font' : ''}`}>
      <div className="border-b border-white/10 bg-white/5 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-teal-200/80">AutoShield AI</p>
            <p className="text-sm font-semibold text-white">{t('shellCommandCenter', 'Command Center')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">{role}</span>
            <button onClick={logout} className="ghost-button px-3 py-1.5 text-xs">{t('shellLogout', 'Logout')}</button>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => [
                'whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all',
                isActive ? 'nav-link-active' : 'nav-link-idle'
              ].join(' ')}
            >
              {t(item.labelKey, item.labelKey)}
            </NavLink>
          ))}
        </div>
      </div>

      <aside className="sidebar hidden w-72 flex-col px-5 py-6 lg:flex">
        <Link to="/app/overview" className="mb-6">
          <div className="brand-panel">
            <p className="text-xs uppercase tracking-wider text-white/80">AutoShield AI</p>
            <p className="text-2xl font-semibold leading-tight mt-1">{t('shellCommandCenter', 'Command Center')}</p>
            <p className="text-xs mt-2 text-white/75">{t('shellIncomeProtection', 'Income protection command center for gig workers')}</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-2">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'nav-link block rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  isActive ? 'nav-link-active' : 'nav-link-idle'
                ].join(' ')
              }
            >
              {t(item.labelKey, item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">{t('shellLoggedInAs', 'Logged in as')}</p>
          <p className="font-semibold text-sm text-slate-800">{profile?.name || 'Operations User'}</p>
          <p className="text-xs text-slate-500 mt-1">{t('shellRole', 'Role')}: {role}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-900"
          >
            {t('shellLogout', 'Logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex h-full flex-col">
        <header className="topbar flex items-center justify-between px-4 py-3 lg:px-6">
          <div>
            <p className="section-rail">{t('shellPlatform', 'AutoShield Platform')}</p>
            <h1 className="text-lg font-semibold text-white">{role === 'admin' ? t('shellAdminTitle', 'Admin Revenue and Fraud Oversight') : t('shellOpsTitle', 'Insurance Operations Suite')}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap justify-end">
            <select value={locale} onChange={(event) => setLocale(event.target.value)} className="input-field w-auto px-3 py-2 text-xs">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
            </select>
            <button onClick={() => setAccessibility({ largeFont: !ui.largeFont })} className="ghost-button px-3 py-2 text-slate-100">
              {ui.largeFont ? t('shellDefaultFont', 'Default Font') : t('shellLargeFont', 'Large Font')}
            </button>
            <button onClick={() => setAccessibility({ colorBlindTheme: !ui.colorBlindTheme })} className="ghost-button px-3 py-2 text-slate-100">
              {ui.colorBlindTheme ? t('shellStandardTheme', 'Standard Theme') : t('shellAccessibleTheme', 'Accessible Theme')}
            </button>
            <Link to="/app/live-ops" className="primary-button px-3 py-2 font-semibold">
              {t('shellOpenLiveOps', 'Open Live Ops')}
            </Link>
            <Link to="/app/settings" className="ghost-button px-3 py-2 text-slate-100">
              {t('shellAccount', 'Account')}
            </Link>
          </div>
        </header>

        <section className="scroll-y flex-1 px-4 py-4 lg:px-6 lg:py-5">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
