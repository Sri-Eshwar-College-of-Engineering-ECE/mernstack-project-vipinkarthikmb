import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF  from 'jspdf';
import { User, Zap, LogOut } from 'lucide-react';
import { getBillSummary } from '../api/consumerApi';
import NotificationWidget from './Notifications';

function EReceipt({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [consumerNo, setConsumerNo] = useState('');
  const [billSummary, setBillSummary] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const storedName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Guest User';
    setUserName(storedName);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Professional Logic-based Badge Styling
  const getStatusConfig = (status) => {
    const configs = {
      Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
      Overdue: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)]' },
      Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
    };
    return configs[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', glow: '' };
  };

  const getNotificationStyles = (severity) => {
    switch (severity) {
      case 'success': return 'bg-emerald-50/80 border-emerald-200 text-emerald-900 shadow-sm';
      case 'info': return 'bg-sky-50/80 border-sky-200 text-sky-900 shadow-sm';
      case 'urgent': return 'bg-orange-50/80 border-orange-200 text-orange-900 shadow-sm';
      case 'warning': return 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-sm';
      case 'overdue': return 'bg-rose-50/80 border-rose-200 text-rose-900 shadow-sm animate-pulse';
      default: return 'bg-white border-slate-200 text-slate-900';
    }
  };

  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatShortDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (value) => `₹${Number(value ?? 0).toFixed(2)}`;

  const buildNotifications = (summary) => {
    if (!summary) return [];
    const notifications = [];

    if (summary.readingPending) {
      notifications.push({
        id: 'reading-due',
        title: 'Reading Required',
        detail: `Submit meter reading by ${formatShortDate(summary.readingWindowEnd)} (window 1-15).`,
        severity: 'warning',
        icon: '🧾'
      });
    }

    if (summary.paymentStatus === 'Paid') {
      notifications.push({
        id: 'payment-success',
        title: 'Payment Confirmed',
        detail: summary.lastPaymentDate
          ? `Payment cleared on ${formatShortDate(summary.lastPaymentDate)}.`
          : 'Payment recorded successfully.',
        severity: 'success',
        icon: '✅'
      });
      // Only show next billing cycle if a new reading has been taken
      if (summary.nextPaymentDeadline) {
        notifications.push({
          id: 'next-cycle',
          title: 'Next Billing Cycle',
          detail: `Payment due: ${formatShortDate(summary.nextPaymentDeadline)}.`,
          severity: 'info',
          icon: '📅'
        });
      } else {
        notifications.push({
          id: 'awaiting-reading',
          title: 'Awaiting Next Reading',
          detail: `Submit your next meter reading during the 1st-15th window.`,
          severity: 'info',
          icon: '📊'
        });
      }
    } else {
      const days = summary.daysUntilDeadline;
      if (summary.isOverdue) {
        notifications.push({
          id: 'overdue',
          title: 'Payment Overdue',
          detail: `Overdue by ${Math.abs(days)} day(s). Settle ₹${formatCurrency(summary.totalAmountDue)} to avoid extra penalties.`,
          severity: 'overdue',
          icon: '🚨'
        });
      } else if (days <= 3) {
        notifications.push({
          id: 'urgent',
          title: 'Urgent Reminder',
          detail: `Only ${days} day(s) left. Due on ${formatShortDate(summary.nextPaymentDeadline)}.`,
          severity: 'urgent',
          icon: '⏰'
        });
      } else if (days <= 7) {
        notifications.push({
          id: 'warning',
          title: 'Upcoming Due Date',
          detail: `Bill due in ${days} day(s) (${formatShortDate(summary.nextPaymentDeadline)}).`,
          severity: 'warning',
          icon: '🟡'
        });
      } else {
        notifications.push({
          id: 'notice',
          title: 'Payment Scheduled',
          detail: `Next due date is ${formatShortDate(summary.nextPaymentDeadline)} (${days} days remaining).`,
          severity: 'info',
          icon: '🔔'
        });
      }
    }

    if (summary.isFineApplied) {
      notifications.push({
        id: 'fine',
        title: 'Fine Applied',
        detail: `Late fee ₹${formatCurrency(summary.fineDetails.totalFineWithTax)} has been added.`,
        severity: 'overdue',
        icon: '⚠️'
      });
    }

    return notifications;
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.clear();
      localStorage.clear();
      navigate('/login');
    }
  };

  const notifications = billSummary ? buildNotifications(billSummary) : [];

  const fetchBillSummary = async (overrideConsumerNo) => {
    const targetConsumer = (overrideConsumerNo ?? consumerNo).trim();

    if (!targetConsumer) {
      setError('Please enter a valid consumer number');
      return;
    }

    setLoading(true);
    setError('');
    setBillSummary(null);

    try {
      const data = await getBillSummary(targetConsumer);
      setBillSummary(data);
    } catch (err) {
      setError('Bill details not found for this consumer number. Please try again.');
      console.error('Error fetching bill summary:', err);
    } finally {
      setLoading(false);
    }
  };

  // If navigated from payment/quickpay with a consumer number, auto-load that receipt
  useEffect(() => {
    if (location.state && location.state.consumerNo) {
      const fromConsumer = String(location.state.consumerNo);
      setConsumerNo(fromConsumer);
      fetchBillSummary(fromConsumer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleDownloadPDF = (data) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = 20;

      const safeNum = (v) => Number(v ?? 0).toFixed(2);
      const fmtDate = (d) => {
        if (!d) return 'N/A';
        const dd = new Date(d);
        if (Number.isNaN(dd.getTime())) return 'N/A';
        return dd.toLocaleDateString('en-IN');
      };

      const billAmount = Number(data.billAmount ?? 0);
      const fineAmount = Number(data.fineDetails?.totalFineWithTax ?? 0);
      const totalDue = Number(data.totalAmountDue ?? billAmount + fineAmount);
      const paidAmount = data.paymentStatus === 'Paid'
        ? Number(data.lastPaidAmount ?? totalDue ?? billAmount)
        : 0;

      // Simple Header with borders
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, pageWidth - 2 * margin, 35);
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('eMeter Seva Power Utility', pageWidth / 2, y + 10, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Official E-Receipt - Powered Billing Platform', pageWidth / 2, y + 17, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Electricity Bill Receipt', pageWidth / 2, y + 27, { align: 'center' });

      y += 40;

      // Payment Status Badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const statusText = data.paymentStatus || 'Pending';
      const statusWidth = doc.getTextWidth(statusText) + 10;
      doc.rect(pageWidth - margin - statusWidth, y, statusWidth, 8);
      doc.text(statusText, pageWidth - margin - statusWidth / 2, y + 6, { align: 'center' });

      y += 12;

      // Consumer Details Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Consumer Details', margin, y);
      y += 2;
      doc.rect(margin, y, (pageWidth - 2 * margin) / 2 - 2, 40);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      y += 7;
      doc.text('Consumer No:', margin + 3, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(data.consumerNumber || 'N/A'), margin + 35, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Name:', margin + 3, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(data.name || 'N/A'), margin + 35, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Meter Serial:', margin + 3, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(data.meterSerialNumber || 'N/A'), margin + 35, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Tariff Plan:', margin + 3, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(data.tariffPlan || 'N/A'), margin + 35, y);

      // Bill Metadata Box (right side)
      let yRight = y - 28;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Bill Metadata', pageWidth / 2 + 2, yRight);
      yRight += 2;
      doc.rect(pageWidth / 2 + 2, yRight, (pageWidth - 2 * margin) / 2 - 2, 40);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      yRight += 7;
      doc.text('Receipt Date:', pageWidth / 2 + 5, yRight);
      doc.setFont('helvetica', 'bold');
      doc.text(fmtDate(new Date()), pageWidth / 2 + 35, yRight);
      
      yRight += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Billing Cycle:', pageWidth / 2 + 5, yRight);
      doc.setFont('helvetica', 'bold');
      doc.text(String(data.billCycleDays || 30) + ' days', pageWidth / 2 + 35, yRight);
      
      yRight += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Due Date:', pageWidth / 2 + 5, yRight);
      doc.setFont('helvetica', 'bold');
      doc.text(fmtDate(data.nextPaymentDeadline), pageWidth / 2 + 35, yRight);
      
      yRight += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Status:', pageWidth / 2 + 5, yRight);
      doc.setFont('helvetica', 'bold');
      doc.text(String(data.paymentStatus || 'Pending'), pageWidth / 2 + 35, yRight);

      y += 18;

      // Charges Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Charges Breakdown', margin, y);
      y += 2;
      
      // Table Header
      doc.rect(margin, y, pageWidth - 2 * margin, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Description', margin + 3, y + 6);
      doc.text('Amount (Rs.)', pageWidth - margin - 30, y + 6, { align: 'right' });
      
      y += 8;
      
      // Energy Charges Row
      doc.rect(margin, y, pageWidth - 2 * margin, 7);
      doc.setFont('helvetica', 'normal');
      doc.text('Energy Charges', margin + 3, y + 5);
      doc.text(safeNum(billAmount), pageWidth - margin - 30, y + 5, { align: 'right' });
      
      y += 7;
      
      // Fines & Tax Row (if applicable)
      if (fineAmount > 0) {
        doc.rect(margin, y, pageWidth - 2 * margin, 7);
        doc.text('Late Payment Fine (incl. GST)', margin + 3, y + 5);
        doc.text(safeNum(fineAmount), pageWidth - margin - 30, y + 5, { align: 'right' });
        y += 7;
      }
      
      // Total Row
      doc.rect(margin, y, pageWidth - 2 * margin, 9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(data.paymentStatus === 'Paid' ? 'Amount Paid' : 'Total Payable', margin + 3, y + 6);
      doc.setFontSize(12);
      const totalAmount = data.paymentStatus === 'Paid' ? paidAmount : totalDue;
      doc.text('Rs. ' + safeNum(totalAmount), pageWidth - margin - 30, y + 6, { align: 'right' });

      y += 14;

      // Usage Details Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Usage Details', margin, y);
      y += 2;
      
      doc.rect(margin, y, pageWidth - 2 * margin, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const col1 = margin + 3;
      const col2 = margin + (pageWidth - 2 * margin) / 3;
      const col3 = margin + 2 * (pageWidth - 2 * margin) / 3;
      
      doc.text('Current Reading', col1, y + 6);
      doc.text('Units (kWh)', col2, y + 6);
      doc.text('Tariff Rate', col3, y + 6);
      
      y += 8;
      doc.rect(margin, y, pageWidth - 2 * margin, 7);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.currentReading ?? '-'), col1, y + 5);
      doc.text(String(data.lastUnitsConsumed ?? '-'), col2, y + 5);
      doc.text('Rs.' + safeNum(data.tariffRate || 0) + '/unit', col3, y + 5);

      y += 12;

      // Footer Note
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('This is a computer-generated receipt. Please retain for your records.', pageWidth / 2, y, { align: 'center' });
      
      y += 5;
      doc.text('For support, contact: billing@emeterseva.in', pageWidth / 2, y, { align: 'center' });

      // Page border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      doc.save('eMeterSeva_Receipt_' + data.consumerNumber + '.pdf');
    } catch (e) {
      console.error(e);
      alert('Unable to generate PDF. Please try again.');
    }
  };

  const getReminderColor = (reminderType) => {
    switch (reminderType) {
      case 'overdue':
        return 'bg-red-100 border-red-400';
      case 'urgent':
        return 'bg-orange-100 border-orange-400';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400';
      case 'notice':
        return 'bg-blue-100 border-blue-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  const getReminderIcon = (reminderType) => {
    switch (reminderType) {
      case 'overdue':
        return '🚨';
      case 'urgent':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'notice':
        return 'ℹ️';
      default:
        return '📋';
    }
  };
  // Logic functions (buildNotifications, fetchBillSummary, handleDownloadPDF) stay exactly as provided...
  // [Placeholder for your existing logic functions]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
              <Zap className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">eMeterSeva<span className="text-indigo-600"> E-Receipt</span></span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <User size={16} className="text-indigo-600" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-slate-700">{userName}</span>
                <span className="text-[11px] font-semibold text-slate-500">{currentDateTime.toLocaleString()}</span>
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

      <NotificationWidget consumerNo={consumerNo} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-10 space-y-10">
        
        {/* Extraordinary Search Section */}
        <section className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-indigo-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Statement Explorer</h2>
            <p className="text-indigo-200/70 mb-8 text-lg">Enter your consumer credentials to retrieve real-time billing analytics and official receipts.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
              <input
                type="text"
                value={consumerNo}
                onChange={(e) => setConsumerNo(e.target.value)}
                placeholder="Consumer Identification Number"
                className="flex-1 bg-transparent px-6 py-4 text-white placeholder:text-slate-400 focus:outline-none font-medium text-lg"
              />
              <button
                onClick={() => fetchBillSummary()}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-10 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Loading</span> : 'Fetch Details'}
              </button>
            </div>
            {error && <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm font-bold"><span className="w-2 h-2 bg-rose-400 rounded-full animate-ping"></span>{error}</div>}
          </div>
        </section>

        {billSummary && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            
            {/* Logic-Driven Notification Grid */}
            {notifications.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notifications.map((note) => (
                  <div key={note.id} className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.02] ${getNotificationStyles(note.severity)}`}>
                    <div className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{note.icon}</div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider mb-1">{note.title}</h4>
                      <p className="text-xs font-medium leading-relaxed opacity-80">{note.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main Data Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Consumer Analytics Card */}
              <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Consumer Profile</h3>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase">Verified Account</span>
                </div>
                <div className="p-8 md:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Full Name</p>
                      <p className="text-xl font-bold text-slate-900">{billSummary.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">ID Reference</p>
                      <p className="text-xl font-bold text-slate-900">#{billSummary.consumerNumber}</p>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Service Address</p>
                      <p className="text-slate-600 font-medium leading-relaxed">{billSummary.address}</p>
                    </div>
                    <div className="pt-4 flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">Plan: {billSummary.tariffPlan}</span>
                      <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">Meter: {billSummary.meterSerialNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Highlight Card */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className={`flex-1 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center border transition-all ${getStatusConfig(billSummary.paymentStatus).bg} ${getStatusConfig(billSummary.paymentStatus).border} ${getStatusConfig(billSummary.paymentStatus).glow}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Current Payable</p>
                  <div className="relative">
                    <span className="absolute -left-6 top-2 text-xl font-bold text-slate-400">₹</span>
                    <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
                      {billSummary.totalAmountDue.toFixed(2)}
                    </h2>
                  </div>
                  <div className={`mt-6 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${getStatusConfig(billSummary.paymentStatus).text} ${getStatusConfig(billSummary.paymentStatus).border} bg-white shadow-sm`}>
                    {billSummary.totalAmountDue === 0 ? 'CLEARED' : billSummary.paymentStatus}
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadPDF(billSummary)}
                  className="group bg-slate-900 hover:bg-indigo-600 text-white p-6 rounded-[2rem] font-bold flex flex-col items-center gap-2 transition-all shadow-xl hover:shadow-indigo-200"
                >
                  <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Download Official PDF</span>
                </button>
              </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Cycle Period', value: `${billSummary.billCycleDays} Days`, sub: 'Standard Cycle', icon: '🗓️' },
                { label: 'Consumption', value: `${billSummary.currentReading}`, sub: 'Units Consumed', icon: '⚡' },
                { label: 'Last Activity', value: billSummary.lastPaymentDate ? formatShortDate(billSummary.lastPaymentDate) : 'No Records', sub: 'Previous Payment', icon: '🕒' },
                { label: 'Due Date', value: formatShortDate(billSummary.nextPaymentDeadline), sub: 'Next Deadline', icon: '🔔' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="text-2xl mb-4">{stat.icon}</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Extraordinary Late Fee Banner */}
            {billSummary.isFineApplied && (
              <div className="relative overflow-hidden bg-rose-50 border border-rose-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
                <div>
                  <h4 className="text-rose-900 font-black uppercase tracking-wider text-sm mb-2">Notice: Compliance Charges Applied</h4>
                  <p className="text-rose-700/80 text-sm font-medium">A statutory late fee including GST/CGST has been appended due to payment delinquency.</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-xs font-bold text-rose-400 uppercase">Fine Breakdown</p>
                  <p className="text-2xl font-black text-rose-600">₹{billSummary.fineDetails.totalFineWithTax.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default EReceipt;