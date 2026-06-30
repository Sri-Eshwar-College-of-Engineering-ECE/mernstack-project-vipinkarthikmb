import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addReading as addReadingApi, getBillSummary } from '../../api/consumerApi';
import { 
  ArrowLeft, 
  Gauge, 
  Hash, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

function AddReading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reading, setReading] = useState({
    consumerNumber: '',
    meterReading: '',
  });

  const [prevReading, setPrevReading] = useState(null);
  const [tariffRate, setTariffRate] = useState(null);
  const [unitsComputed, setUnitsComputed] = useState(null);
  const [amountComputed, setAmountComputed] = useState(null);

  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setReading({ ...reading, [e.target.name]: e.target.value });
  };

  // Prefill consumer number from navigation state or query param
  useEffect(() => {
    const stateConsumer = location.state?.consumerNumber;
    const params = new URLSearchParams(window.location.search);
    const queryConsumer = params.get('consumer');
    const initial = stateConsumer || queryConsumer;
    if (initial) {
      setReading(prev => ({ ...prev, consumerNumber: initial }));
    }
  }, [location.state]);

  // Fetch existing consumer reading and tariff when consumer id entered
  useEffect(() => {
    const id = reading.consumerNumber.trim();
    if (id.length < 10) {
      setPrevReading(null);
      setTariffRate(null);
      setStatus({ type: '', msg: '' });
      return;
    }

    const handle = setTimeout(async () => {
      try {
        const data = await getBillSummary(id);
        setPrevReading(Number(data.currentReading || 0));
        setTariffRate(Number(data.tariffRate || 0));
        setStatus({ type: '', msg: '' });
      } catch (err) {
        setPrevReading(null);
        setTariffRate(null);
        const errMsg = err?.response?.data?.message || 'Consumer not found. Please verify the ID.';
        setStatus({ type: 'error', msg: errMsg });
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [reading.consumerNumber]);

  // Compute units and amount as user types current reading
  useEffect(() => {
    if (prevReading === null || tariffRate === null) {
      setUnitsComputed(null);
      setAmountComputed(null);
      return;
    }
    const currentVal = Number(reading.meterReading);
    if (!Number.isFinite(currentVal)) {
      setUnitsComputed(null);
      setAmountComputed(null);
      return;
    }
    const units = currentVal - prevReading;
    setUnitsComputed(units);
    if (units > 0) {
      setAmountComputed(units * tariffRate);
    } else {
      setAmountComputed(null);
    }
  }, [reading.meterReading, prevReading, tariffRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (prevReading === null || tariffRate === null) {
      setStatus({ type: 'error', msg: 'Enter a valid consumer ID to load previous reading and tariff.' });
      return;
    }

    const currentVal = Number(reading.meterReading);
    if (!Number.isFinite(currentVal) || currentVal <= 0) {
      setStatus({ type: 'error', msg: 'Please enter a valid meter reading above 0.' });
      return;
    }

    const unitsToRecord = currentVal - prevReading;

    setIsSubmitting(true);
    try {
      await addReadingApi(reading.consumerNumber, {
        unitsConsumed: unitsToRecord,
        currentReading: currentVal,
        readingDate: new Date().toISOString(),
        adminOverride: true,
      });
      setStatus({ type: 'success', msg: `Reading for ${reading.consumerNumber} recorded successfully!` });
      setReading(prev => ({ ...prev, meterReading: '' }));
      setUnitsComputed(null);
      setAmountComputed(null);
      // Navigate back to dashboard's Missed tab and refresh
      setTimeout(() => {
        navigate('/admin-dashboard', { state: { tab: 'missed' } });
      }, 800);
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to update reading. Verify Consumer ID.';
      setStatus({ type: 'error', msg: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center p-6">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-12 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors self-start max-w-lg mx-auto w-full"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      {/* Main Card - Removed overflow-hidden to let icon pop out */}
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 relative">
        
        {/* Floating Icon Container - Absolute positioned outside the box */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-teal-500 w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-teal-500/40 border-4 border-white">
            <Gauge size={38} strokeWidth={2.5} />
          </div>
        </div>

        {/* Header Section - Internal overflow hidden for rounded top */}
        <div className="bg-slate-900 pt-16 pb-8 px-8 text-center rounded-t-[2.5rem] overflow-hidden">
          <h2 className="text-2xl font-black text-white tracking-tight">eMeter Seva Intake</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Telemetry Intake & Meter Logging</p>
        </div>

        {/* Form Body */}
        <div className="p-8 md:p-10">
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
            {/* Consumer Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identify Consumer</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="consumerNumber"
                  placeholder="e.g. ES-992031"
                  value={reading.consumerNumber}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white transition-all text-slate-800 font-bold outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Reading & Tariff Info (Left on desktop) */}
              <div className="space-y-2 md:order-1 order-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Previous Reading / Tariff</label>
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-4 text-sm text-slate-700 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between"><span className="font-semibold">Previous</span><span className="font-bold">{prevReading !== null ? `${prevReading} kWh` : '--'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Tariff</span><span className="font-bold">{tariffRate !== null ? `Rs.${tariffRate}/unit` : '--'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Units (new - prev)</span><span className="font-bold">{unitsComputed !== null ? unitsComputed : '--'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Amount</span><span className="font-bold">{amountComputed !== null ? `Rs. ${amountComputed.toFixed(2)}` : '--'}</span></div>
                  <div className="text-[11px] text-slate-500">Logging Date: auto (today)</div>
                </div>
              </div>

              {/* Reading Value (Right on desktop) */}
              <div className="space-y-2 md:order-2 order-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current kWh</label>
                <div className="relative rounded-2xl border-2 border-transparent bg-slate-50 focus-within:border-teal-500/20 focus-within:bg-white transition-all">
                  <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="meterReading"
                    placeholder="Enter latest meter reading"
                    value={reading.meterReading}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] ${
                isSubmitting 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30'
              }`}
            >
              {isSubmitting ? 'Synchronizing...' : 'Submit Log Entry'}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        Secured eMeter Seva Telemetry Link
      </p>
    </div>
  );
}

export default AddReading;