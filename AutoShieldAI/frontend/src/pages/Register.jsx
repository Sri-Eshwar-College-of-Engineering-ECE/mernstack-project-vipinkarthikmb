import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlatform } from '../context/PlatformContext';

function mapAuthError(message = '', t = (key, fallback) => fallback || key) {
  if (message.includes('auth/configuration-not-found')) {
    return t('authErrorRegisterDisabled', 'Credential sign-up is not enabled for this environment. Contact operations support.');
  }
  if (message.includes('auth/email-already-in-use')) {
    return t('authErrorUserExists', 'This phone/email is already registered. Please sign in instead.');
  }
  if (message.includes('auth/weak-password')) {
    return t('authErrorWeakPassword', 'Password is too weak. Use at least 6 characters.');
  }
  if (message.includes('auth/network-request-failed')) {
    return t('authErrorNetwork', 'Network error while contacting authentication services. Check internet and retry.');
  }

  return message || t('authErrorRegisterFailed', 'Registration failed');
}

export default function Register() {
  const nav = useNavigate();
  const { registerWorker, t } = usePlatform();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', zone: 'urban',
    vehicleType: 'bike', avgIncome: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await registerWorker({
        ...form,
        avgIncome: Number(form.avgIncome)
      });
      nav('/app/overview');
    } catch (err) {
      setError(mapAuthError(err.message, t));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 text-slate-100 lg:px-8 animated-surface">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hero-panel p-6 lg:p-8 reveal-up">
          <p className="section-rail">{t('registerRail', 'Build your profile')}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white lg:text-6xl">{t('registerHeroTitle', 'Create a worker profile and unlock live protection.')}</h1>
          <p className="mt-4 text-slate-300">
            {t('registerHeroSub', 'The registration flow captures zone, vehicle type, and income baseline, then boots the policy and realtime dashboard without extra files or dead screens.')}
          </p>

          <div className="mt-6 space-y-3">
            <div className="timeline-item reveal-up">
              <div className="timeline-node">1</div>
              <div className="timeline-panel">
                <p className="text-sm font-semibold text-white">Identity setup</p>
                <p className="text-sm text-slate-300">Create profile details and secure credentials.</p>
              </div>
            </div>
            <div className="timeline-item reveal-up" style={{ animationDelay: '70ms' }}>
              <div className="timeline-node">2</div>
              <div className="timeline-panel">
                <p className="text-sm font-semibold text-white">Risk-aware onboarding</p>
                <p className="text-sm text-slate-300">Zone and income values shape policy behavior instantly.</p>
              </div>
            </div>
            <div className="timeline-item reveal-up" style={{ animationDelay: '120ms' }}>
              <div className="timeline-node">3</div>
              <div className="timeline-panel">
                <p className="text-sm font-semibold text-white">Live activation</p>
                <p className="text-sm text-slate-300">Claims and operations stream unlock immediately after register.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="status-card p-4 reveal-up">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t('registerPolicySetup', 'Policy setup')}</p>
              <p className="mt-1 text-sm text-slate-200">{t('registerPolicySetupDesc', 'Premium is generated from the live profile payload')}</p>
            </div>
            <div className="status-card p-4 reveal-up" style={{ animationDelay: '120ms' }}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t('registerRealtimeReady', 'Realtime ready')}</p>
              <p className="mt-1 text-sm text-slate-200">{t('registerRealtimeReadyDesc', 'Claims and policy events are visible as soon as they are created')}</p>
            </div>
          </div>
        </div>

        <div className="surface-panel-strong p-6 lg:p-8 reveal-up" style={{ animationDelay: '130ms' }}>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 float-soft items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-amber-300 text-3xl text-slate-950 shadow-lg">🛡️</div>
            <h2 className="text-2xl font-bold text-white">{t('appName', 'AutoShield AI')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('registerTagline', 'Income protection for gig workers')}</p>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('settingsName', 'Full Name')}</label>
                <input required value={form.name} onChange={set('name')} className="input-field mt-1" placeholder="Ravi Kumar" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('settingsPhone', 'Phone')}</label>
                <input required value={form.phone} onChange={set('phone')} className="input-field mt-1" placeholder="9876543210" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('registerEmailOptional', 'Email (optional)')}</label>
              <input value={form.email} onChange={set('email')} type="email" className="input-field mt-1" placeholder="ravi@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('registerZone', 'Zone')}</label>
                <select value={form.zone} onChange={set('zone')} className="input-field mt-1">
                  <option value="urban">{t('zoneUrban', 'Urban')}</option>
                  <option value="semi-urban">{t('zoneSemiUrban', 'Semi-Urban')}</option>
                  <option value="rural">{t('zoneRural', 'Rural')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('registerVehicle', 'Vehicle')}</label>
                <select value={form.vehicleType} onChange={set('vehicleType')} className="input-field mt-1">
                  <option value="bike">{t('vehicleBike', 'Bike')}</option>
                  <option value="auto">{t('vehicleAuto', 'Auto')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('registerWeeklyIncome', 'Weekly Income (INR)')}</label>
              <input required value={form.avgIncome} onChange={set('avgIncome')} type="number" min="500" className="input-field mt-1" placeholder="3500" />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('loginPassword', 'Password')}</label>
              <input required value={form.password} onChange={set('password')} type="password" minLength={6} className="input-field mt-1" placeholder={t('registerPasswordPlaceholder', 'Min 6 characters')} />
            </div>

            <button type="submit" disabled={loading} className="primary-button w-full py-3">
              {loading ? t('registerSubmitting', 'Calculating your premium...') : t('registerCta', 'Register and Get Protected')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            {t('registerAlready', 'Already registered?')} <Link to="/login" className="font-medium text-teal-200 hover:text-teal-100">{t('registerSignIn', 'Sign in')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
