import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaLock, FaUnlock, FaMoneyBill, FaTruck } from 'react-icons/fa';

export default function ProcurementPayment() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.get(`${apiBaseUrl}/api/payments/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelivery = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      await axios.patch(
        `${apiBaseUrl}/api/payments/orders/${id}/confirm-delivery`,
        { confirmedBy: localStorage.getItem('userId') },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // Refresh data
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <FaMoneyBill className="text-green-600" /> Vendor Payments
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Order ID: {order.orderId || order._id}</h2>

            <p className="text-gray-600 mb-1">
              Vendor: <span className="text-gray-800">{order.vendorName || order.vendorCompanyName}</span>
            </p>
            <p className="text-gray-600 mb-1">Amount: ₹{order.amount}</p>
            <p className="text-gray-600 mb-2 flex items-center gap-2">
              Status:
              <span
                className={`ml-2 px-2 py-1 text-sm font-semibold rounded-full ${
                  order.status === 'Delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'Confirmed' || order.status === 'In Progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.status === 'In Transit'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {order.status}
              </span>
            </p>

            <div className="mt-4">
              {order.delivered || order.status === 'Delivered' ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <FaUnlock /> Payment Released
                </div>
              ) : order.status === 'Confirmed' || order.status === 'In Progress' || order.status === 'In Transit' ? (
                <button
                  onClick={() => confirmDelivery(order._id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  <FaTruck /> Confirm Delivery & Release Payment
                </button>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600 font-medium">
                  <FaLock /> Payment Locked until Order Confirmation
                </div>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full text-center text-gray-500 mt-10">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
