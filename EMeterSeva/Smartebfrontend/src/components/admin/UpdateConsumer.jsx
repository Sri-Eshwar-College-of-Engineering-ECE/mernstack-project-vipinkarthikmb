import React, { useState } from 'react';
import httpClient from '../../api/httpClient';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserCog, 
  Search, 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Cpu,
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

function UpdateConsumer() {
  const navigate = useNavigate();
  const [consumerNumber, setConsumerNumber] = useState('');
  const [consumerData, setConsumerData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    tariffPlan: '',
    meterSerialNumber: '',
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isFetching, setIsFetching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFetchConsumer = async () => {
    if (!consumerNumber) return;
    setIsFetching(true);
    setStatus({ type: '', msg: '' });
    
    try {
      const response = await httpClient.get(`/consumers/${consumerNumber}`);
      setConsumerData(response.data);
    } catch (error) {
      console.error('Error fetching consumer:', error);
      setStatus({ type: 'error', msg: 'Record not found. Verify Consumer ID.' });
      setConsumerData({ name: '', address: '', phoneNumber: '', tariffPlan: '', meterSerialNumber: '' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateConsumer = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await httpClient.put(`/consumers/${consumerNumber}`, consumerData);
      setStatus({ type: 'success', msg: 'Telemetry profile updated successfully!' });
    } catch (error) {
      console.error('Error updating consumer:', error);
      setStatus({ type: 'error', msg: 'Failed to synchronize updates.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center py-12 px-6">
      
      {/* Back Button */}
      <div className="w-full max-w-2xl mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-200 relative">
        
        {/* Floating Icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-teal-500 w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-teal-500/40 border-4 border-white">
            <UserCog size={38} strokeWidth={2.5} />
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-slate-900 pt-16 pb-10 px-8 text-center rounded-t-[2.5rem] overflow-hidden">
          <h2 className="text-2xl font-black text-white tracking-tight">Modify Consumer</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Update Service Point Records</p>
        </div>

        <div className="p-8 md:p-12">
          {/* Step 1: Search Bar */}
          <div className="bg-slate-50 rounded-3xl p-3 mb-8 flex flex-col md:flex-row gap-3 border border-slate-100 shadow-inner">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search Consumer ID..."
                value={consumerNumber}
                onChange={(e) => setConsumerNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 font-bold outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleFetchConsumer}
              disabled={isFetching}
              className="bg-slate-800 hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isFetching ? 'Locating...' : 'Fetch'}
            </button>
          </div>

          {/* Status Notifications */}
          {status.msg && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border animate-in slide-in-from-top-2 duration-300 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.msg}
            </div>
          )}

          {/* Step 2: Update Form (Conditionally Rendered) */}
          {consumerData.name && (
            <form onSubmit={handleUpdateConsumer} className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input
                      type="text"
                      value={consumerData.name}
                      onChange={(e) => setConsumerData({ ...consumerData, name: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input
                      type="text"
                      value={consumerData.phoneNumber}
                      onChange={(e) => setConsumerData({ ...consumerData, phoneNumber: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={consumerData.address}
                    onChange={(e) => setConsumerData({ ...consumerData, address: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tariff Plan</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <select
                      value={consumerData.tariffPlan}
                      onChange={(e) => setConsumerData({ ...consumerData, tariffPlan: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none appearance-none"
                    >
                      <option value="Domestic">Domestic</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meter Serial</label>
                  <div className="relative group">
                    <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input
                      type="text"
                      value={consumerData.meterSerialNumber}
                      onChange={(e) => setConsumerData({ ...consumerData, meterSerialNumber: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] mt-4 ${
                  isUpdating 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30'
                }`}
              >
                {isUpdating ? 'Synchronizing...' : 'Commit Changes'}
              </button>
            </form>
          )}

          {!consumerData.name && !status.msg && (
            <div className="py-12 text-center text-slate-300">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-sm uppercase tracking-widest">Awaiting Consumer ID</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        eMeter Seva Administrative Portal
      </p>
    </div>
  );
}

export default UpdateConsumer;