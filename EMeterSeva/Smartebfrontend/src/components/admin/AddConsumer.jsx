import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import httpClient from '../../api/httpClient';
import { 
  ArrowLeft, 
  UserPlus, 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Cpu,
  Hash,
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

function AddConsumer() {
  const navigate = useNavigate();
  const [consumer, setConsumer] = useState({
    consumerNumber: '',
    meterSerialNumber: '',
    name: '',
    address: '',
    phoneNumber: '',
    tariffPlan: 'Domestic',
  });

  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setConsumer({ ...consumer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setIsSubmitting(true);

    try {
      await httpClient.post('/consumers', consumer);
      setStatus({ type: 'success', msg: 'New consumer account provisioned successfully!' });
      // Reset form
      setConsumer({
        consumerNumber: '',
        meterSerialNumber: '',
        name: '',
        address: '',
        phoneNumber: '',
        tariffPlan: 'Domestic',
      });
    } catch (err) {
      console.error('Error adding consumer:', err);
      setStatus({ type: 'error', msg: 'Deployment failed. Check if Consumer Number already exists.' });
    } finally {
      setIsSubmitting(false);
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
            <UserPlus size={38} strokeWidth={2.5} />
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-slate-900 pt-16 pb-10 px-8 text-center rounded-t-[2.5rem] overflow-hidden">
          <h2 className="text-2xl font-black text-white tracking-tight">Onboard Consumer</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Register New Service Point</p>
        </div>

        <div className="p-8 md:p-12">
          {/* Status Message */}
          {status.msg && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border animate-in slide-in-from-top-2 duration-300 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Consumer & Meter IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consumer Number</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <input
                    type="text"
                    name="consumerNumber"
                    placeholder="UID-8829"
                    value={consumer.consumerNumber}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meter Serial</label>
                <div className="relative group">
                  <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <input
                    type="text"
                    name="meterSerialNumber"
                    placeholder="SN-X001"
                    value={consumer.meterSerialNumber}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={consumer.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input
                  type="text"
                  name="address"
                  placeholder="123 Grid Lane, Sector 4"
                  value={consumer.address}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                />
              </div>
            </div>

            {/* Phone & Tariff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="+1 234 567"
                    value={consumer.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tariff Selection</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <select
                    name="tariffPlan"
                    value={consumer.tariffPlan}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none appearance-none"
                  >
                    <option value="Domestic">Domestic</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] mt-4 ${
                isSubmitting 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30'
              }`}
            >
              {isSubmitting ? 'Provisioning...' : 'Register Consumer'}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        eMeter Seva Administrative Portal
      </p>
    </div>
  );
}

export default AddConsumer;