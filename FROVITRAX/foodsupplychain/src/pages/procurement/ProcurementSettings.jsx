import { useNavigate } from 'react-router-dom';

export default function ProcurementSettings() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-emerald-600 mb-6 text-center">Procurement Settings</h1>
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Notification Preferences</label>
            <select className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition">
              <option>Email Only</option>
              <option>SMS Only</option>
              <option>Email & SMS</option>
              <option>None</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Theme</label>
            <select className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-emerald-400 focus:border-emerald-400 transition">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/procurementaccount')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow"
          >
            Back to Account
          </button>
          <button
            className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition shadow"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
