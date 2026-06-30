import React, { useEffect, useState } from 'react';
import { RefreshCw, Tag, Clock, Database, AlertCircle, MapPin } from 'lucide-react';

const FIREBASE_URL = 'https://rfidscanner-52fdb-default-rtdb.asia-southeast1.firebasedatabase.app/rfid.json';

const MonitoringPage = () => {
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionInputs, setSectionInputs] = useState({});
  const [submitStatus, setSubmitStatus] = useState({});

  useEffect(() => {
    let interval;

    const fetchData = async () => {
      try {
        console.log('Fetching Firebase data...');
        const res = await fetch(FIREBASE_URL);
        const data = await res.json();
        console.log('Firebase data received:', data);

        let newData = [];
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Handle Firebase data structure where keys are tag IDs
          newData = Object.entries(data).map(([boxId, fields]) => ({
            boxId: boxId,
            status: fields.status || 'Scanned',
            time: fields.time || 'N/A',
            timestamp: fields.timestamp,
            dateTime: fields.timestamp ? new Date(fields.timestamp * 1000).toLocaleString() : new Date().toLocaleString()
          }));
        }

        console.log('Processed data:', newData);
        setScanData(newData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch live scan data');
        setLoading(false);
      }
    };

    fetchData();
    interval = setInterval(fetchData, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSave = async (boxId) => {
    const section = sectionInputs[boxId];
    if (!section) {
      alert('Please select a section');
      return;
    }

    setSubmitStatus(prev => ({ ...prev, [boxId]: 'Saving...' }));

    try {
      const scanItem = scanData.find(item => item.boxId === boxId);
      const payload = {
        tag: boxId,
        box: boxId,
        status: scanItem.status,
        timestamp: scanItem.timestamp,
        time: scanItem.time,
        section: section
      };

      const response = await fetch('http://localhost:5001/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus(prev => ({ ...prev, [boxId]: 'Saved!' }));
        setTimeout(() => {
          setSubmitStatus(prev => ({ ...prev, [boxId]: '' }));
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSubmitStatus(prev => ({ ...prev, [boxId]: `Error: ${error.message}` }));
      setTimeout(() => {
        setSubmitStatus(prev => ({ ...prev, [boxId]: '' }));
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-amber-100 flex flex-col items-center py-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            RFID Live Monitoring
          </h1>
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
        </div>

        <p className="text-gray-600 mb-6">
          Live updates from RFID scans. Select a section for each box and save to database.
        </p>

        {loading && (
          <div className="text-center text-blue-600 py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading scans...
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 py-8 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {scanData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scans available. Waiting for Firebase data...
              </div>
            ) : (
              scanData.map((scan, index) => (
                <div key={scan.boxId + index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Box ID</label>
                      <div className="font-mono text-blue-700 font-bold">{scan.boxId}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Date & Time</label>
                      <div className="text-gray-800">{scan.dateTime}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                        {scan.status}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Section</label>
                      <div className="flex gap-2">
                        <select
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={sectionInputs[scan.boxId] || ''}
                          onChange={(e) => setSectionInputs(prev => ({ ...prev, [scan.boxId]: e.target.value }))}
                        >
                          <option value="">Select Section</option>
                          <option value="Warehouse">Warehouse</option>
                          <option value="Packaging">Packaging</option>
                          <option value="Finishing">Finishing</option>
                          <option value="Dispatch">Dispatch</option>
                        </select>
                        <button
                          onClick={() => handleSave(scan.boxId)}
                          disabled={!sectionInputs[scan.boxId] || submitStatus[scan.boxId]?.includes('Saving')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                      {submitStatus[scan.boxId] && (
                        <div className={`text-xs mt-1 ${submitStatus[scan.boxId].includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                          {submitStatus[scan.boxId]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;
