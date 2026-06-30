import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { markPaymentAsPaid } from '../api/consumerApi';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management for the simulation flow
  const [paymentStep, setPaymentStep] = useState('idle'); // idle, processing, showingQR, success
  const [dummyPaymentId] = useState(`PAYID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

  const { 
    consumerNo = "N/A", 
    consumerName = "Guest User", 
    amount = 0, 
    dueDate = "N/A" 
  } = location.state || {};

  // Simulate the payment process after QR is "scanned"
  useEffect(() => {
    if (paymentStep === 'showingQR') {
      const timer = setTimeout(() => {
        setPaymentStep('success');
      }, 5000); // 5 seconds wait time
      return () => clearTimeout(timer);
    }

    if (paymentStep === 'success') {
      const timer = setTimeout(async () => {
        try {
          if (consumerNo && consumerNo !== 'N/A') {
            await markPaymentAsPaid(consumerNo);
          }
        } catch (err) {
          console.error('Error marking payment as paid from Payment page:', err);
        }

        alert(`Payment Successful! Transaction ID: ${dummyPaymentId}`);
        navigate('/ereciept', { state: { consumerNo } }); // Redirect to E-Receipt for this consumer
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [paymentStep, navigate, dummyPaymentId]);

  const startPaymentFlow = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('showingQR');
    }, 1500); // Short loading delay before QR shows
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        {paymentStep === 'idle' && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 text-center">Confirm Payment</h1>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Consumer No:</span>
                <span className="text-sm font-bold text-slate-800">{consumerNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Name:</span>
                <span className="text-sm font-bold text-slate-800">{consumerName}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-base font-semibold text-slate-600">Amount Due:</span>
                <span className="text-2xl md:text-3xl font-black text-emerald-600">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Due Date:</span>
                <span className="text-sm font-bold text-slate-800">{dueDate}</span>
              </div>
            </div>
            <button 
              onClick={startPaymentFlow} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl text-base md:text-lg shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              Proceed with QR Payment
            </button>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-slate-200">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mb-6"></div>
            <p className="text-lg font-semibold text-slate-700">Initializing Secure Payment Gateway...</p>
          </div>
        )}

        {paymentStep === 'showingQR' && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-center border-2 border-blue-500">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-3">Scan to Pay</h2>
            <p className="text-sm text-slate-600 mb-6">Use any UPI App (PhonePe, GPay, Paytm)</p>
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl mb-6 inline-block">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=test@upi&pn=SmartEB&am=${amount}&cu=INR`} 
                alt="Payment QR Code" 
                className="w-48 h-48 md:w-56 md:h-56 mx-auto"
              />
            </div>
            <p className="text-sm text-slate-500 italic mb-4">Waiting for payment confirmation... (5s)</p>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[fillProgress_5s_linear]"></div>
            </div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-emerald-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl text-emerald-600">✓</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-emerald-600 mb-4">Payment Successful!</h2>
            <p className="text-slate-700 mb-2">Transaction ID:</p>
            <p className="text-lg font-bold text-slate-900 mb-4">{dummyPaymentId}</p>
            <p className="text-sm text-slate-500">Redirecting you back to home...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payment;