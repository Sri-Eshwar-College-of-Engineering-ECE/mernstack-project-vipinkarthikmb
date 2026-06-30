import { useNavigate } from 'react-router-dom';

export default function VendorSettings() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-gray-900 p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-blue-200">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Vendor Settings</h1>
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-blue-800 font-medium">Notification Preferences</label>
            <select className="w-full px-4 py-2 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 focus:ring-2 focus:ring-blue-300 transition">
              <option>Email Only</option>
              <option>SMS Only</option>
              <option>Email & SMS</option>
              <option>None</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-blue-800 font-medium">Theme</label>
            <select className="w-full px-4 py-2 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 focus:ring-2 focus:ring-blue-300 transition">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate('/vendoraccount')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Account
          </button>
        </div>
      </div>
    </div>
  );
}
