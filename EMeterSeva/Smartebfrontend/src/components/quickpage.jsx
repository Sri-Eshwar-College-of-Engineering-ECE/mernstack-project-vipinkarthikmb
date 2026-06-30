import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import httpClient from '../api/httpClient';
import { markPaymentAsPaid } from '../api/consumerApi';
import NotificationWidget from './Notifications';
import { 
  Zap, 
  LogOut, 
  User, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ChevronRight, 
  ShieldCheck, 
  Loader2,
  Receipt,
  ArrowLeft
} from 'lucide-react';

function QuickPay({ onLogout }) {
  const navigate = useNavigate();
  
  // App State
  const [userName, setUserName] = useState('');
  const [now, setNow] = useState(new Date());
  const [consumerNo, setConsumerNo] = useState('');
  const [consumerName, setConsumerName] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  // Payment UI State
  const [paymentStep, setPaymentStep] = useState('idle'); // idle, choosingMethod, active, processing, success
  const [method, setMethod] = useState('qr'); // qr or bank
  const [dummyId, setDummyId] = useState('');

  useEffect(() => {
    const storedName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Guest User';
    setUserName(storedName);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
    else { localStorage.clear(); navigate('/login'); }
  };

  const fetchConsumerDetails = async () => {
    const id = consumerNo.trim();
    if (id.length < 6) {
      setAlreadyPaid(false);
      return;
    }
    try {
      const { data } = await httpClient.get(`/consumers/bill-summary/${id}`);
      setConsumerName(data.name);
      setPaymentStatus(data.paymentStatus);
      
      if (data.paymentStatus === 'Paid') {
        setAmount(0);
        setAlreadyPaid(true);
      } else {
        setAmount(data.totalAmountDue || data.billAmount || 0);
        setAlreadyPaid(false);
      }
      setDueDate(data.nextPaymentDeadline ? new Date(data.nextPaymentDeadline).toLocaleDateString() : "N/A");
    } catch (error) {
      if (error?.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.clear();
        navigate('/login');
      } else {
        alert('Consumer not found.');
      }
      setAlreadyPaid(false);
    }
  };

  const triggerSuccess = () => {
    setPaymentStep('processing');
    setDummyId(`TXN${Math.floor(100000 + Math.random() * 900000)}`);
    
    setTimeout(() => {
      setPaymentStep('success');
    }, 3000); 
  };

  const finalizeRedirect = async () => {
    try {
      if (consumerNo) {
        await markPaymentAsPaid(consumerNo);
      }
    } catch (err) {
      console.error('Error marking payment as paid:', err);
      alert('Payment succeeded but updating bill status failed. Please check E-Receipt.');
    }
    alert('Payment Receipt Generated Successfully!');
    navigate('/ereciept', { state: { consumerNo } });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100">
      
      {/* Floating Notification Widget */}
      <NotificationWidget consumerNo={consumerNo} />

      {/* GridVision Premium Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <Zap className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">eMeterSeva<span className="text-indigo-600"> QuickPay</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <User size={16} className="text-indigo-600" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-slate-700">{userName}</span>
                <span className="text-[11px] font-semibold text-slate-500">{now.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[380px] sm:max-w-[440px] border border-slate-100 overflow-hidden">
          
          <div className="bg-indigo-600 p-6 sm:p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-1">Secure Checkout</p>
             <h2 className="text-3xl font-black tracking-tight">QuickPay</h2>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consumer Credentials</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="ID Number" 
                  value={consumerNo}
                  onChange={(e) => setConsumerNo(e.target.value)}
                  className="flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                />
                <button 
                  onClick={fetchConsumerDetails} 
                  className="bg-slate-900 text-white px-6 rounded-2xl font-bold hover:bg-black transition-colors shadow-lg active:scale-95"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Bill Summary Card */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium">Customer</span>
                <span className="text-slate-800 font-bold">{consumerName || '---'}</span>
              </div>
              <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                <span className="text-slate-400 text-sm font-medium">Payable Amount</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{amount || '0.00'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-4 text-sm">
                <span className="text-slate-400 font-medium">Due Date</span>
                <span className="text-slate-800 font-bold">{dueDate || 'N/A'}</span>
              </div>
              
              {paymentStatus && (
                <div className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                  paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {paymentStatus === 'Paid' ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>}
                  {paymentStatus}
                </div>
              )}
            </div>

            {alreadyPaid ? (
               <div className="bg-green-500/10 border border-green-200 p-4 rounded-2xl flex items-center gap-3 text-green-700">
                  <div className="bg-green-500 text-white p-1 rounded-full"><CheckCircle2 size={16}/></div>
                  <p className="text-xs font-bold uppercase tracking-tight">System recognizes this bill as fully settled.</p>
               </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 justify-center">
                <ShieldCheck size={14} className="text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Bank-grade Encrypted Transaction</span>
              </div>
            )}

            <button 
              disabled={!amount || alreadyPaid}
              onClick={() => setPaymentStep('choosingMethod')}
              className={`group w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                amount && !alreadyPaid 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 transform hover:-translate-y-1' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {alreadyPaid ? 'Bill Settled' : 'Proceed to Pay'}
              {!alreadyPaid && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- PREMIUM PAYMENT MODAL --- */}
      {paymentStep !== 'idle' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-[360px] sm:max-w-[420px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300">
            
            {/* Modal Step: Choose Method */}
            {paymentStep === 'choosingMethod' && (
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Payment Method</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">Select your preferred way to pay</p>
                
                <div className="space-y-3">
                  <button onClick={() => {setMethod('qr'); setPaymentStep('active');}} className="w-full border-2 border-slate-50 hover:border-indigo-500 p-5 rounded-[1.5rem] flex items-center gap-4 transition-all hover:bg-indigo-50 group">
                    <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Smartphone size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-800">UPI QR Code</p>
                      <p className="text-xs text-slate-400 font-bold">GPay, PhonePe, Paytm</p>
                    </div>
                  </button>

                  <button onClick={() => {setMethod('bank'); setPaymentStep('active');}} className="w-full border-2 border-slate-50 hover:border-indigo-500 p-5 rounded-[1.5rem] flex items-center gap-4 transition-all hover:bg-indigo-50 group">
                    <div className="bg-slate-100 p-3 rounded-2xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Banknote size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-800">Bank Transfer</p>
                      <p className="text-xs text-slate-400 font-bold">Direct IMPS/NEFT</p>
                    </div>
                  </button>
                </div>
                
                <button onClick={() => setPaymentStep('idle')} className="w-full mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
                   <ArrowLeft size={14}/> Cancel
                </button>
              </div>
            )}

            {/* Modal Step: Active QR/Bank */}
            {paymentStep === 'active' && (
              <div className="p-6 sm:p-8 text-center">
                {method === 'qr' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="font-black text-xl mb-6 text-slate-800">Scan & Pay</h3>
                    <div className="bg-slate-50 p-6 rounded-[2rem] inline-block mb-6 relative group">
                      <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                      <img 
                        className="rounded-xl mix-blend-multiply"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=smarteb@paytm&pn=SmartEB&am=${amount}&cu=INR`} 
                        alt="UPI QR"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="bg-indigo-50 py-3 rounded-xl inline-flex items-center px-4 gap-2">
                         <Loader2 className="animate-spin text-indigo-600" size={16} />
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Waiting for mobile app</span>
                      </div>
                      <button onClick={triggerSuccess} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                         Simulate Payment Callback
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-left space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="font-black text-xl mb-6 text-center text-slate-800">Bank Details</h3>
                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem]">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Name</p>
                          <input type="text" defaultValue="eMeter Seva Services" className="w-full bg-transparent border-b-2 border-slate-200 py-2 outline-none font-bold text-slate-700" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</p>
                          <input type="text" defaultValue="9823 4410 2201" className="w-full bg-transparent border-b-2 border-slate-200 py-2 outline-none font-bold text-slate-700" />
                        </div>
                    </div>
                    <button onClick={triggerSuccess} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 mt-4 active:scale-95 transition-all">
                        Pay ₹{amount}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Modal Step: Processing */}
            {paymentStep === 'processing' && (
              <div className="p-12 sm:p-16 text-center">
                <div className="relative w-24 h-24 mx-auto mb-8">
                   <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="text-indigo-600 w-10 h-10" />
                   </div>
                </div>
                <h3 className="font-black text-2xl text-slate-800 mb-2">Verifying</h3>
                <p className="text-slate-400 font-medium animate-pulse">Confirming secure tokens...</p>
              </div>
            )}

            {/* Modal Step: Success */}
            {paymentStep === 'success' && (
              <div className="p-6 sm:p-8 text-center bg-white animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-200 ring-8 ring-green-50">
                   <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-1">Payment Success</h3>
                <p className="text-slate-400 font-medium mb-8">Your transaction was verified.</p>
                
                <div className="bg-slate-50 rounded-[1.5rem] p-5 text-left mb-8 border border-slate-100">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</span>
                      <span className="text-xs font-mono font-black text-indigo-600">{dummyId}</span>
                   </div>
                   <div className="h-px bg-slate-200 my-3"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                      <span className="font-black text-slate-800">₹{amount}</span>
                   </div>
                </div>

                <button 
                  onClick={finalizeRedirect} 
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                >
                  <Receipt size={20}/> Get E-Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickPay;