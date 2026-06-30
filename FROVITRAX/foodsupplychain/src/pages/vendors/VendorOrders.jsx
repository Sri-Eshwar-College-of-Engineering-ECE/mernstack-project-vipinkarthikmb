import { useState, useEffect } from 'react';
import { FaSearch, FaClipboardList, FaSpinner, FaCheck, FaTimes, FaClock, FaTruck } from 'react-icons/fa';
import axios from 'axios';

export default function VendorOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statusOptions = ['All', 'Pending', 'Confirmed', 'In Progress', 'In Transit', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiBaseUrl}/api/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      setError(`Failed to fetch orders: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      await axios.patch(`${apiBaseUrl}/api/orders/${orderId}/status`,
        { status: newStatus, updatedBy: localStorage.getItem('userId') },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      setError(`Failed to update order: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch =
      order.items?.some(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-purple-100 text-purple-800',
    'In Transit': 'bg-indigo-100 text-indigo-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <FaClock />;
      case 'Confirmed': return <FaCheck />;
      case 'In Progress': return <FaSpinner className="animate-spin" />;
      case 'In Transit': return <FaTruck />;
      case 'Delivered': return <FaCheck />;
      case 'Cancelled': return <FaTimes />;
      default: return <FaClock />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-pink-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-pink-50 p-6 text-gray-800">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 shadow-sm">
          <p>{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
          <FaClipboardList /> Vendor Orders
        </h1>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              statusFilter === status
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'bg-white text-gray-700 hover:bg-indigo-100 border border-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white shadow rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              {['Order ID', 'Items', 'Total Amount', 'Procurement Manager', 'Status', 'Actions'].map((header, idx) => (
                <th key={idx} className="text-left px-4 py-3 font-semibold text-indigo-800 text-sm">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-indigo-50 transition">
                  <td className="px-4 py-3 text-sm font-medium">#{order.orderId}</td>
                  <td className="px-4 py-3 text-sm">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <div key={i}>{item.itemName} ({item.quantity} {item.unit})</div>
                    ))}
                    {order.items?.length > 2 && (
                      <div className="text-xs text-gray-400">+{order.items.length - 2} more items</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{order.totalAmount}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>{order.createdBy?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{order.createdBy?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm flex flex-wrap gap-2">
                    {order.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Confirmed')}
                          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs flex items-center gap-1"
                        ><FaCheck /> Accept</button>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center gap-1"
                        ><FaTimes /> Reject</button>
                      </>
                    )}
                    {order.status === 'Confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'In Progress')}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs flex items-center gap-1"
                      ><FaSpinner /> Start</button>
                    )}
                    {order.status === 'In Progress' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'In Transit')}
                        className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs flex items-center gap-1"
                      ><FaTruck /> Ship</button>
                    )}
                    {order.status === 'In Transit' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'Delivered')}
                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs flex items-center gap-1"
                      ><FaCheck /> Delivered</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 py-6">
                  {orders.length === 0 ? 'No orders received yet.' : 'No orders match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      {orders.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Orders', value: orders.length, color: 'text-indigo-600' },
            { title: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: 'text-yellow-600' },
            { title: 'In Progress', value: orders.filter(o => ['Confirmed','In Progress','In Transit'].includes(o.status)).length, color: 'text-blue-600' },
            { title: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, color: 'text-green-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg transition">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
