import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { usePlatform } from '../context/PlatformContext';

function mapAuthError(message = '', t = (key, fallback) => fallback || key) {
  if (message.includes('Enter email or mobile')) {
    return t('authErrorIdentifier', 'Enter a valid email or mobile number.');
  }
  if (message.includes('at least 6 characters')) {
    return t('authErrorShortPassword', 'Password must be at least 6 characters.');
  }
  if (message.includes('Invalid credentials')) {
    return t('authErrorInvalidCredentials', 'Invalid email/mobile number or password.');
  }
  if (message.includes('auth/network-request-failed')) {
    return t('authErrorNetwork', 'Network error while contacting authentication services. Check internet and retry.');
  }

  return message || t('authErrorLoginFailed', 'Login failed');
}

export default function Login() {
  const nav = useNavigate();
  const { signInWithIdentifierPassword, t } = usePlatform();
  const [form,    setForm]    = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function validate() {
    const identifier = String(form.identifier || '').trim();
    const password = String(form.password || '');

    if (!identifier) {
      return t('authErrorIdentifier', 'Enter a valid email or mobile number.');
    }
    if (password.length < 6) {
      return t('authErrorShortPassword', 'Password must be at least 6 characters.');
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true); setError('');
    try {
      await signInWithIdentifierPassword({
        identifier: String(form.identifier).trim(),
        password: form.password
      });
      await api.get('/auth/me', { fresh: true });
      nav('/app/overview');
    } catch (err) {
      setError(mapAuthError(err.message, t));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 text-slate-100 lg:px-8 animated-surface">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-panel-strong landing-orbital p-6 lg:p-8 reveal-up">
          <p className="section-rail">{t('loginRail', 'Return to operations')}</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white lg:text-6xl">{t('loginHeroTitle', 'Sign in and open the live command center.')}</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            {t('loginHeroSub', 'Access policy status, claims history, live disruptions, and AI-driven premium signals from one authenticated session.')}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="status-card p-4 reveal-up">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Live claims</p>
              <p className="mt-2 text-2xl font-bold text-white">24/7</p>
            </div>
            <div className="status-card p-4 reveal-up" style={{ animationDelay: '70ms' }}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Settlement lane</p>
              <p className="mt-2 text-2xl font-bold text-white">Realtime</p>
            </div>
            <div className="status-card p-4 reveal-up" style={{ animationDelay: '120ms' }}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Risk visibility</p>
              <p className="mt-2 text-2xl font-bold text-white">AI Ready</p>
            </div>
          </div>

          <div className="mt-6 timeline">
            <div className="timeline-item">
              <div className="timeline-node pulse-soft">1</div>
              <div className="timeline-panel text-sm text-slate-200">Authenticate with email or mobile credentials.</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-node pulse-soft">2</div>
              <div className="timeline-panel text-sm text-slate-200">Session token enables secure API actions instantly.</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-node pulse-soft">3</div>
              <div className="timeline-panel text-sm text-slate-200">Open operations with live claims and payout visibility.</div>
            </div>
          </div>
        </div>

        <div className="hero-panel p-6 lg:p-8 reveal-up" style={{ animationDelay: '140ms' }}>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 float-soft items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-amber-300 text-3xl text-slate-950 shadow-lg">🛡️</div>
            <h2 className="text-2xl font-bold text-white">{t('loginWelcome', 'Welcome back')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('appName', 'AutoShield AI')}</p>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('loginIdentifier', 'Email or Mobile Number')}</label>
              <input required value={form.identifier} onChange={set('identifier')} className="input-field mt-1" placeholder={t('loginIdentifierPlaceholder', 'you@example.com or 9876543210')} />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('loginPassword', 'Password')}</label>
              <input required value={form.password} onChange={set('password')} type="password" className="input-field mt-1" placeholder={t('loginPasswordPlaceholder', 'Your password')} />
            </div>
            <button type="submit" disabled={loading} className="primary-button w-full py-3">
              {loading ? t('loginSubmitting', 'Signing in...') : t('loginCta', 'Sign In')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            {t('loginNewWorker', 'New worker?')} <Link to="/register" className="font-medium text-teal-200 hover:text-teal-100">{t('loginGetProtected', 'Get protected')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
