import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import httpClient from '../../api/httpClient';
import { getConsumersWithFines, getConsumersWithMissedReadings } from '../../api/consumerApi';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Edit3, 
  Search, 
  Trash2, 
  LogOut, 
  AlertTriangle, 
  LayoutDashboard,
  Database,
  X,
  Gauge,
  Settings2 // Added for Update/Settings feel
} from 'lucide-react';

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [consumers, setConsumers] = useState([]);
  const [consumersWithFines, setConsumersWithFines] = useState([]);
  const [consumerNumber, setConsumerNumber] = useState('');
  const [consumerData, setConsumerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showFinesTab, setShowFinesTab] = useState(false);
  const [showMissedTab, setShowMissedTab] = useState(false);
  const [missedReadings, setMissedReadings] = useState([]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    document.title = "eMeter Seva | Admin Dashboard";
    fetchConsumers();
    // If navigated back with a state to focus on missed tab, activate it
    if (location.state?.tab === 'missed') {
      setShowMissedTab(true);
      setShowFinesTab(false);
    }
  }, []);

  const fetchConsumers = async () => {
    try {
      const response = await httpClient.get('/consumers');
      if (Array.isArray(response.data)) {
        setConsumers(response.data);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch consumers.');
    }
  };

  useEffect(() => {
    const fetchFines = async () => {
      if (showFinesTab) {
        try {
          const data = await getConsumersWithFines();
          setConsumersWithFines(data);
        } catch (error) {
          console.error('Error fetching fines:', error);
        }
      }
    };
    fetchFines();
  }, [showFinesTab]);

  useEffect(() => {
    const fetchMissed = async () => {
      if (showMissedTab) {
        try {
          const data = await getConsumersWithMissedReadings();
          setMissedReadings(data);
        } catch (error) {
          console.error('Error fetching missed readings:', error);
        }
      }
    };
    fetchMissed();
  }, [showMissedTab]);

  const handleSearchConsumer = async () => {
    if (!consumerNumber) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await httpClient.get(`/consumers/${consumerNumber}`);
      if (res.data) {
        setConsumerData(res.data);
      } else {
        setConsumerData(null);
        setErrorMessage('Consumer not found in eMeter Seva registry.');
      }
    } catch (err) {
      setConsumerData(null);
      setErrorMessage('Search failed. Check consumer ID.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmation = () => {
    if (!consumerNumber) {
      alert('Please enter a consumer number first');
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteConsumer = async () => {
    setErrorMessage('');
    try {
      await httpClient.delete(`/consumers/${consumerNumber}`);
      setMessage(`Consumer ${consumerNumber} successfully purged from eMeter Seva.`);
      fetchConsumers();
      setConsumerData(null);
      setConsumerNumber('');
    } catch (error) {
      setErrorMessage('Critical Error: Failed to terminate consumer.');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-6 flex flex-col shadow-xl z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-teal-500 p-2 rounded-xl text-white shadow-lg shadow-teal-500/30">
            <LayoutDashboard size={20} />
          </div>
          <h2 className="text-white font-bold text-xl tracking-tight">eMeter Seva</h2>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Main Menu</p>
          <button 
            onClick={() => setShowFinesTab(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!showFinesTab ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'hover:bg-slate-800'}`}
          >
            <Users size={18} /> <span className="text-sm font-semibold">Registry</span>
          </button>
          
          <button 
            onClick={() => navigate('/add-reading')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <Gauge size={18} /> <span className="text-sm font-semibold">Meter Reading</span>
          </button>

          <button 
            onClick={() => { setShowFinesTab(true); setShowMissedTab(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${showFinesTab ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'hover:bg-slate-800'}`}
          >
            <AlertTriangle size={18} /> <span className="text-sm font-semibold">Penalties</span>
          </button>

          <button 
            onClick={() => { setShowMissedTab(true); setShowFinesTab(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${showMissedTab ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'hover:bg-slate-800'}`}
          >
            <AlertTriangle size={18} /> <span className="text-sm font-semibold">Missed Readings</span>
          </button>
        </nav>

        <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
          <LogOut size={18} /> <span className="text-sm font-bold">Sign Out</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        
        {/* Header with Quick Action Buttons */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">eMeter Seva Console</h1>
            <p className="text-sm text-slate-500 font-medium">Infrastructure Management & Billing Control</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/add-reading')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-md transition-all active:scale-95">
              <FileText size={14} className="text-blue-600"/> Meter Reading
            </button>
            {/* Added Update Consumer Button in Header */}
            <button onClick={() => navigate('/update-consumer')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-md transition-all active:scale-95">
              <Edit3 size={14} className="text-amber-500"/> Update Profile
            </button>
            <button onClick={() => navigate('/add-consumer')} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 shadow-lg transition-all active:scale-95">
              <UserPlus size={14} className="text-teal-400"/> New Account
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Bar */}
            <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Query consumer ID..."
                  value={consumerNumber}
                  onChange={(e) => setConsumerNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 text-sm outline-none"
                />
              </div>
              <div className="flex gap-2 p-1">
                <button onClick={handleSearchConsumer} className="bg-slate-900 text-white px-8 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">Fetch</button>
                <button onClick={openDeleteConfirmation} className="bg-rose-50 text-rose-600 px-6 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all">Terminate</button>
              </div>
            </div>

            {/* Notification Bar */}
            {(message || errorMessage) && (
              <div className={`p-4 rounded-xl text-sm font-bold border animate-in slide-in-from-top-2 ${message ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {message ? '✓ ' : '✕ '} {message || errorMessage}
              </div>
            )}

            {/* Content Pane */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
              {!showFinesTab && !showMissedTab ? (
                <div className="p-8">
                  {consumerData ? (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumer Profile</h3>
                        <button onClick={() => navigate('/update-consumer')} className="text-teal-600 text-xs font-bold flex items-center gap-2 hover:underline">
                          <Edit3 size={14}/> Edit Profile
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DataBox label="Legal Name" value={consumerData.name} />
                        <DataBox 
                          label="Outstanding Dues" 
                          value={consumerData.paymentStatus === 'Paid' || consumerData.amount === 0 ? '₹0.00 (CLEARED)' : `₹${consumerData.amount?.toFixed(2)}`} 
                          highlight 
                        />
                        <DataBox label="Tariff Class" value={consumerData.tariffPlan} />
                        <DataBox label="Meter Serial" value={consumerData.meterSerialNumber} />
                        <DataBox label="Contact Info" value={consumerData.phoneNumber} />
                        <DataBox label="Address" value={consumerData.address} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                      <Search size={60} strokeWidth={1} className="mb-4 opacity-20"/>
                      <p className="font-medium italic">No record selected from GridRegistry</p>
                    </div>
                  )}
                </div>
              ) : showFinesTab ? (
                <FineTable data={consumersWithFines} />
              ) : (
                <MissedTable data={missedReadings} />
              )}
            </div>
          </div>

          {/* Right Registry Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database size={16} className="text-teal-500"/> Master Registry
              </h3>
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {consumers.map((c) => (
                  <div key={c.consumerNumber} className="group p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-200 transition-all flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{c.consumerNumber}</p>
                    </div>
                    {/* Quick Edit Icon in Registry list */}
                    <button 
                      onClick={() => navigate('/update-consumer')}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-teal-600 transition-all"
                      title="Update Consumer"
                    >
                      <Settings2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* --- TERMINATION CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Termination</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Are you sure you want to delete <span className="font-bold text-slate-800">{consumerNumber}</span>? 
                This action will permanently purge all consumption data from the <span className="font-bold">eMeter Seva</span> database.
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDeleteConsumer} className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all active:scale-95">
                  Confirm Delete
                </button>
              </div>
            </div>
            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const DataBox = ({ label, value, highlight }) => (
  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-bold ${highlight ? 'text-teal-600 text-lg' : 'text-slate-700'}`}>{value || '—'}</p>
  </div>
);

const FineTable = ({ data }) => (
  <div className="overflow-x-auto">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/20">
      <h3 className="font-bold text-slate-800">Outstanding Penalties</h3>
      <span className="bg-rose-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">Action Required</span>
    </div>
    {data.length > 0 ? (
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <th className="px-6 py-4">Account</th>
            <th className="px-6 py-4">Arrears</th>
            <th className="px-6 py-4">Penalty</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((c) => (
            <tr key={c._id} className="hover:bg-slate-50/80 transition-all">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{c.consumerNumber}</p>
              </td>
              <td className="px-6 py-4 text-sm font-medium">₹{c.amount?.toFixed(2)}</td>
              <td className="px-6 py-4 text-sm font-black text-rose-600">₹{c.totalFineWithTax?.toFixed(2)}</td>
              <td className="px-6 py-4">
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-3 py-1 rounded-lg uppercase">Unpaid</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="p-20 text-center text-slate-400 font-medium italic">No active penalties detected.</div>
    )}
  </div>
);

const MissedTable = ({ data }) => (
  <div className="overflow-x-auto">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/40">
      <h3 className="font-bold text-slate-800">Missed Meter Readings</h3>
      <span className="bg-amber-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">Attention</span>
    </div>
    {data.length > 0 ? (
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <th className="px-6 py-4">Account</th>
            <th className="px-6 py-4">Tariff</th>
            <th className="px-6 py-4">Last Bill Date</th>
            <th className="px-6 py-4">Reading Window</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((c) => (
            <tr key={c.consumerNumber} className="hover:bg-slate-50/80 transition-all">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{c.consumerNumber}</p>
              </td>
              <td className="px-6 py-4 text-sm font-medium">{c.tariffPlan}</td>
              <td className="px-6 py-4 text-sm font-medium">{c.lastBillDate ? new Date(c.lastBillDate).toDateString() : '—'}</td>
              <td className="px-6 py-4 text-sm font-medium">{new Date(c.readingWindowStart).toDateString()} → {new Date(c.readingWindowEnd).toDateString()}</td>
              <td className="px-6 py-4">
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-lg uppercase">Missed</span>
                <button
                  onClick={() => window.location.href = `/add-reading?consumer=${encodeURIComponent(c.consumerNumber)}`}
                  className="ml-3 text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                >
                  Reviewed
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="p-20 text-center text-slate-400 font-medium italic">No missed readings detected.</div>
    )}
  </div>
);

export default AdminDashboard;