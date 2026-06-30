import { useState, useEffect } from 'react';
import { FaTruck, FaFilter, FaCheckCircle, FaClock, FaTimesCircle, FaPlus, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statuses = ['All', 'Pending', 'Confirmed', 'In Progress', 'In Transit', 'Delivered', 'Cancelled'];

export default function ProcurementOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please login.');
          return;
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiBaseUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(res.data)) setOrders(res.data);
        else setOrders([]);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || err.message);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders based on status and search input
  const filtered = orders.filter(order => {
    const statusMatch = filterStatus === 'All' || order.status === filterStatus;
    const searchMatch = search === '' || (
      (order.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.vendorCompanyName || order.vendorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.itemsDescription || '').toLowerCase().includes(search.toLowerCase())
    );
    return statusMatch && searchMatch;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const statusIcon = status => {
    if (status === 'Delivered') return <FaCheckCircle className="text-green-500" />;
    if (status === 'Pending') return <FaClock className="text-yellow-500" />;
    if (status === 'Confirmed' || status === 'In Progress') return <FaClock className="text-blue-500" />;
    if (status === 'In Transit') return <FaTruck className="text-purple-500" />;
    if (status === 'Cancelled') return <FaTimesCircle className="text-red-500" />;
    return <FaClock className="text-gray-400" />;
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-green-700">
            <FaTruck /> Orders Overview
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow w-full sm:w-72">
              <FaSearch className="text-green-700 mr-2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => navigate('/placeorder')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 transition shadow-md"
            >
              <FaPlus /> New Order
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Status Filter */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <FaFilter className="text-gray-500" />
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1 rounded-full border transition duration-300 ${
                filterStatus === status
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-100 hover:text-green-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Order Statistics */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-500">{statusCounts['Pending'] || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
            <p className="text-2xl font-bold text-green-500">{statusCounts['Delivered'] || 0}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-xl shadow-xl bg-white">
          <table className="min-w-full text-sm table-auto">
            <thead className="bg-green-100 text-green-700 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Vendor</th>
                <th className="py-3 px-4 text-left">Items</th>
                <th className="py-3 px-4 text-left">Quantity</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(order => (
                  <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">{order.orderId || order._id}</td>
                    <td className="py-3 px-4">{order.vendorCompanyName || order.vendorName}</td>
                    <td className="py-3 px-4">{order.itemsDescription || 'Multiple items'}</td>
                    <td className="py-3 px-4">{order.quantity || 'N/A'}</td>
                    <td className="py-3 px-4">{new Date(order.date || order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 flex items-center gap-2">{statusIcon(order.status)} {order.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FaShoppingCart className="text-4xl text-gray-400" />
                      <p className="text-lg">
                        {orders.length === 0
                          ? "No orders found. Start by placing your first order!"
                          : `No orders found for "${filterStatus}" or search.`}
                      </p>
                      {orders.length === 0 && (
                        <button
                          onClick={() => navigate('/placeorder')}
                          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        >
                          Place Your First Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
