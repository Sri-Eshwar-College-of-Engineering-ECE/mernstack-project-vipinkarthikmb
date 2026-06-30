import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaLock, FaUnlock, FaMoneyBill } from 'react-icons/fa';

export default function VendorPayment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const res = await axios.get(`${apiBaseUrl}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend returns payments filtered by the logged-in user role
      setPayments(res.data || []);
    } catch (err) {
      console.error('Error fetching vendor payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50 text-gray-700">
        <p className="text-lg font-medium">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-800 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 flex items-center gap-3">
        <FaMoneyBill className="text-blue-600" /> My Payment Details
      </h1>

      {payments.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
          No payment records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Order ID: {payment.order?.orderId || payment.orderId || payment._id}
              </h2>
              <p className="text-gray-600 mb-1">Amount: ₹{payment.amount}</p>
              <p className="text-gray-600 mb-1">
                Date:{' '}
                {payment.createdAt
                  ? new Date(payment.createdAt).toLocaleDateString()
                  : '-'}
              </p>

              <p className="text-gray-700 mb-2">
                Status:
                <span
                  className={`ml-2 px-2 py-1 text-sm rounded-full font-semibold ${
                    payment.status === 'Released'
                      ? 'bg-blue-100 text-blue-700'
                      : payment.status === 'Locked'
                      ? 'bg-yellow-100 text-yellow-800'
                      : payment.status === 'Pending'
                      ? 'bg-orange-100 text-orange-700'
                      : payment.status === 'Refunded'
                      ? 'bg-indigo-100 text-indigo-700'
                      : payment.status === 'Failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {payment.status}
                </span>
              </p>

              <div className="mt-4">
                {payment.status === 'Released' ? (
                  <div className="text-blue-600 flex items-center gap-2 font-medium">
                    <FaUnlock /> Payment Received
                  </div>
                ) : payment.status === 'Locked' ? (
                  <div className="text-yellow-600 flex items-center gap-2 font-medium">
                    <FaLock /> Payment Locked
                  </div>
                ) : payment.status === 'Pending' ? (
                  <div className="text-orange-600 flex items-center gap-2 font-medium">
                    <FaLock /> Payment Pending
                  </div>
                ) : payment.status === 'Refunded' ? (
                  <div className="text-indigo-600 flex items-center gap-2 font-medium">
                    <FaUnlock /> Payment Refunded
                  </div>
                ) : payment.status === 'Failed' ? (
                  <div className="text-red-600 flex items-center gap-2 font-medium">
                    <FaLock /> Payment Failed
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
