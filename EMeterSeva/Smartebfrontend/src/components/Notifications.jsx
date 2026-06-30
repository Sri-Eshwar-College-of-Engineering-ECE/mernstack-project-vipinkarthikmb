import React, { useState, useEffect } from 'react';
import { getBillSummary } from '../api/consumerApi';

function NotificationWidget({ consumerNo: propConsumerNo }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [consumerNo, setConsumerNo] = useState(propConsumerNo || localStorage.getItem('consumerNo') || '');

  const formatShortDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (value) => `₹${Number(value ?? 0).toFixed(2)}`;

  const buildNotifications = (summary) => {
    if (!summary) return [];
    const notifs = [];

    if (summary.paymentStatus === 'Paid') {
      notifs.push({
        id: 'payment-success',
        title: '✅ Payment Successful',
        detail: summary.lastPaymentDate
          ? `Paid on ${formatShortDate(summary.lastPaymentDate)}`
          : 'Payment recorded successfully.',
        severity: 'success',
        icon: '💚'
      });

      notifs.push({
        id: 'next-cycle',
        title: '📅 Next Billing Cycle',
        detail: `Due on ${formatShortDate(summary.nextPaymentDeadline)}`,
        severity: 'info',
        icon: '🔔'
      });
    } else {
      const days = summary.daysUntilDeadline;
      
      if (summary.isOverdue) {
        notifs.push({
          id: 'overdue',
          title: '🚨 Overdue!',
          detail: `Overdue by ${Math.abs(days)} day(s). Pay ${formatCurrency(summary.totalAmountDue)}`,
          severity: 'overdue',
          icon: '⚠️'
        });
      } else if (days <= 1) {
        notifs.push({
          id: 'due-today',
          title: '⏰ Due Today!',
          detail: `Pay ${formatCurrency(summary.totalAmountDue)} now`,
          severity: 'urgent',
          icon: '🔴'
        });
      } else if (days <= 3) {
        notifs.push({
          id: 'urgent',
          title: '⏳ 3 Days Left',
          detail: `${days} days to pay ${formatCurrency(summary.totalAmountDue)}`,
          severity: 'urgent',
          icon: '🟠'
        });
      } else if (days <= 5) {
        notifs.push({
          id: 'five-days',
          title: '📢 5 Days to Go',
          detail: `Due on ${formatShortDate(summary.nextPaymentDeadline)}`,
          severity: 'warning',
          icon: '🟡'
        });
      } else if (days <= 7) {
        notifs.push({
          id: 'week-notice',
          title: '📋 Due This Week',
          detail: `${days} days remaining`,
          severity: 'warning',
          icon: '📆'
        });
      } else {
        notifs.push({
          id: 'upcoming',
          title: '🔔 Upcoming Bill',
          detail: `Due in ${days} days`,
          severity: 'info',
          icon: '📅'
        });
      }
    }

    if (summary.isFineApplied) {
      notifs.push({
        id: 'fine',
        title: '💸 Late Fee Applied',
        detail: `Fine: ${formatCurrency(summary.fineDetails?.totalFineWithTax || 0)}`,
        severity: 'overdue',
        icon: '⚠️'
      });
    }

    return notifs;
  };

  useEffect(() => {
    if (consumerNo && consumerNo.trim()) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [consumerNo]);

  const fetchNotifications = async () => {
    if (!consumerNo || !consumerNo.trim()) return;
    
    setLoading(true);
    try {
      const data = await getBillSummary(consumerNo.trim());
      const notifs = buildNotifications(data);
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationStyles = (severity) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'urgent':
        return 'bg-orange-50 border-l-4 border-orange-500';
      case 'overdue':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-400';
    }
  };

  if (!consumerNo || !consumerNo.trim()) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110"
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notification Panel */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between">
            <h3 className="font-bold text-lg">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-3xl block mb-2">✨</span>
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 ${getNotificationStyles(notif.severity)} hover:bg-opacity-75 cursor-pointer transition-all`}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl flex-shrink-0">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="w-full text-purple-600 hover:text-purple-700 text-sm font-semibold py-2 rounded-lg transition-colors hover:bg-purple-50 disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationWidget;
