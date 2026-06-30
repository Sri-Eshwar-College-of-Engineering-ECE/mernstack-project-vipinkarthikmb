import { useEffect, useState } from 'react';
import { usePlatform } from '../context/PlatformContext';

export default function Settings() {
  const { profile, saveProfile, ui, setAccessibility, t } = usePlatform();
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    notifySms: true,
    notifyEmail: false,
    literacyMode: Boolean(profile?.literacyMode || ui.literacyMode),
    largeFont: Boolean(profile?.largeFont || ui.largeFont),
    colorBlindTheme: Boolean(profile?.colorBlindTheme || ui.colorBlindTheme),
    voiceOnboarding: Boolean(profile?.voiceOnboarding || ui.voiceOnboarding)
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: profile?.name || current.name,
      email: profile?.email || current.email,
      phone: profile?.phone || current.phone,
      literacyMode: Boolean(profile?.literacyMode || ui.literacyMode),
      largeFont: Boolean(profile?.largeFont || ui.largeFont),
      colorBlindTheme: Boolean(profile?.colorBlindTheme || ui.colorBlindTheme),
      voiceOnboarding: Boolean(profile?.voiceOnboarding || ui.voiceOnboarding)
    }));
  }, [profile, ui]);

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function savePreferences(e) {
    e.preventDefault();
    try {
      await saveProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        literacyMode: form.literacyMode,
        largeFont: form.largeFont,
        colorBlindTheme: form.colorBlindTheme,
        voiceOnboarding: form.voiceOnboarding
      });
      setAccessibility({
        literacyMode: form.literacyMode,
        largeFont: form.largeFont,
        colorBlindTheme: form.colorBlindTheme,
        voiceOnboarding: form.voiceOnboarding
      });
      setMessage(t('settingsSaved', 'Preferences updated successfully.'));
    } catch (error) {
      setMessage(error.message || t('settingsSaveFailed', 'Failed to update preferences.'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="hero-panel p-5">
        <p className="section-rail">{t('settingsRail', 'Settings')}</p>
        <h2 className="text-xl font-semibold text-white">{t('settingsTitle', 'Settings and Preferences')}</h2>
        <p className="text-sm text-slate-300">{t('settingsSubtitle', 'Manage account details, communication channels, and accessibility options.')}</p>
      </div>

      <form onSubmit={savePreferences} className="surface-panel p-5 space-y-3 max-w-4xl">
        <h3 className="text-lg font-semibold text-white">{t('settingsProfile', 'Profile')}</h3>
        <Input label={t('settingsName', 'Full Name')} value={form.name} onChange={(v) => update('name', v)} />
        <Input label={t('settingsEmail', 'Email')} value={form.email} onChange={(v) => update('email', v)} />
        <Input label={t('settingsPhone', 'Phone')} value={form.phone} onChange={(v) => update('phone', v)} />

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.notifySms} onChange={(e) => update('notifySms', e.target.checked)} />
            {t('settingsSmsNotify', 'SMS notifications for policy and claim updates')}
          </label>
          <label className="mt-2 flex items-center gap-2">
            <input type="checkbox" checked={form.notifyEmail} onChange={(e) => update('notifyEmail', e.target.checked)} />
            {t('settingsEmailNotify', 'Email summary notifications')}
          </label>
          <label className="mt-2 flex items-center gap-2">
            <input type="checkbox" checked={form.literacyMode} onChange={(e) => update('literacyMode', e.target.checked)} />
            {t('settingsLiteracyMode', 'Literacy-friendly mode')}
          </label>
          <label className="mt-2 flex items-center gap-2">
            <input type="checkbox" checked={form.voiceOnboarding} onChange={(e) => update('voiceOnboarding', e.target.checked)} />
            {t('settingsVoiceOnboarding', 'Voice onboarding')}
          </label>
        </div>

        <button className="primary-button px-4 py-2 text-sm">{t('settingsSave', 'Save Preferences')}</button>
        {message && <p className="text-sm text-teal-200">{message}</p>}
      </form>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="block text-sm text-slate-200">
      <span className="text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field mt-1"
      />
    </label>
  );
}

