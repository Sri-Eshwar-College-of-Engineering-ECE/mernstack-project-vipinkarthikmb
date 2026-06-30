import {
  FaBoxes, FaShoppingCart, FaUsers, FaBell,
  FaUserCircle, FaPlus, FaClock, FaUserCog, FaSignOutAlt,
  FaCogs, FaHome, FaMoneyBill, FaMicrochip, FaClipboardCheck
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FrovitraxLogo from '../../assets/Frovitrax Logo2.png';

export default function ProcurementDashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Loading...' });
  const [stats, setStats] = useState({ totalOrders: 0, inventoryItems: 0, vendors: 0 });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const statsArray = [
    { title: 'Total Orders', icon: <FaShoppingCart />, value: stats.totalOrders },
    { title: 'Inventory Items', icon: <FaBoxes />, value: stats.inventoryItems },
    { title: 'Vendors', icon: <FaUsers />, value: stats.vendors },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) return setLoading(false);

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const [userRes, ordersRes, inventoryRes, vendorsRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/auth/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiBaseUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiBaseUrl}/api/inventory`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiBaseUrl}/api/vendor`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setUser(userRes.data.user || { name: 'User' });

        setStats({
          totalOrders: ordersRes.data.length,
          inventoryItems: inventoryRes.data.length,
          vendors: vendorsRes.data.length
        });

        const recent = ordersRes.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(order => ({
            id: order.orderId || order._id,
            item: order.items?.map(i => i.itemName).join(', ') || 'Multiple items',
            status: order.status,
            time: getTimeAgo(order.createdAt),
            vendor: order.vendorCompanyName || order.vendorName
          }));
        setRecentOrders(recent);

        const inventoryAlerts = [];
        inventoryRes.data.forEach(item => {
          const quantity = item.quantity || 0;
          const minStock = item.minStockLevel || 0;
          if (quantity === 0) inventoryAlerts.push(`Out of stock: ${item.itemName}`);
          else if (quantity <= minStock) inventoryAlerts.push(`Low stock: ${item.itemName} (${quantity} ${item.unit})`);
          if (item.expiryDate) {
            const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) inventoryAlerts.push(`Expiring soon: ${item.itemName} (${daysUntilExpiry} days)`);
            else if (daysUntilExpiry <= 0) inventoryAlerts.push(`Expired: ${item.itemName} (${Math.abs(daysUntilExpiry)} days ago)`);
          }
        });

        const pendingOrders = ordersRes.data.filter(o => o.status === 'Pending').length;
        if (pendingOrders > 0) inventoryAlerts.push(`${pendingOrders} pending order${pendingOrders > 1 ? 's' : ''} awaiting confirmation`);

        setAlerts(inventoryAlerts.slice(0, 6));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800 transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col justify-between py-0 px-4 sticky top-0 h-screen border-r border-gray-200 font-normal text-2xl text-gray-900">
        <div className="flex flex-col h-full">
          <div className="flex justify-center items-start">
            <img src={FrovitraxLogo} alt="FROVITRAX Logo" className="w-auto h-24 object-contain" />
          </div>
          <nav className="space-y-6 text-base font-semibold text-gray-800 mt-6 mb-6">
            <SidebarButton icon={<FaHome />} label="Home" onClick={() => navigate('/procurementdashboard')} active />
            <SidebarButton icon={<FaBoxes />} label="Inventory" onClick={() => navigate('/procurementinventory')} />
            <SidebarButton icon={<FaShoppingCart />} label="Orders" onClick={() => navigate('/procurementorders')} />
            <SidebarButton icon={<FaUsers />} label="Vendors" onClick={() => navigate('/procurementvendorslist')} />
            <SidebarButton icon={<FaMoneyBill />} label="Payments" onClick={() => navigate('/procurementpayment')} />
            <SidebarButton icon={<FaMicrochip />} label="Device Track" onClick={() => navigate('/prodevicetrack')} />
            <SidebarButton icon={<FaClipboardCheck />} label="Reports" onClick={() => navigate('/procurementreport')} />
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-end mb-10">
          <div className="flex items-center gap-6 relative">
            <FaBell className="text-xl text-green-700 animate-pulse cursor-pointer" />
            <div className="relative flex items-center gap-2 cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
              <FaUserCircle className="text-3xl text-gray-600 hover:text-green-700" />
              <p className="text-sm font-medium hidden md:block">{loading ? 'Loading...' : user.fullName || user.name}</p>
            </div>

            {profileOpen && (
              <div className="absolute top-12 right-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <ul className="text-sm py-2 text-gray-800">
                  <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/procurementaccount')}><FaUserCog /> My Account</li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/procurementSettings')}><FaCogs /> Settings</li>
                  <li className="px-4 py-2 text-red-500 flex items-center gap-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/login')}><FaSignOutAlt /> Logout</li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">
            Welcome back, {loading ? '...' : user.fullName || user.name || 'Procurement Manager'}! 👋
          </h2>
          <p className="text-sm text-gray-700">
            Track your supply chain, manage orders, and monitor vendor activities.
          </p>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {statsArray.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition transform hover:-translate-y-1 hover:scale-[1.03] duration-300">
              <div className="text-3xl text-green-700 mb-2">{stat.icon}</div>
              <h3 className="text-sm text-gray-500">{stat.title}</h3>
              <p className="text-xl font-bold text-gray-800">{loading ? <span className="animate-pulse">Loading...</span> : stat.value}</p>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex gap-6 flex-wrap">
            <ActionButton icon={<FaPlus />} label="New Order" bg="green" onClick={() => navigate('/placeorder')} />
            <ActionButton icon={<FaClock />} label="Review Inventory" bg="orange" onClick={() => navigate('/procurementinventory')} />
            <ActionButton icon={<FaMicrochip />} label="Device Track" bg="blue" onClick={() => navigate('/prodevicetrack')} />
            <ActionButton icon={<FaClipboardCheck />} label="Reports" bg="green" onClick={() => navigate('/procurementreport')} />
          </div>
        </section>

        {/* Recent Orders */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{order.id}</td>
                    <td className="px-4 py-3">{order.item}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Pending' ? 'bg-yellow-200 text-yellow-800 animate-pulse' :
                        order.status === 'Delivered' ? 'bg-green-300 text-green-900' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Alerts */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts</h3>
          <ul className="space-y-3">
            {alerts.map((alert, i) => (
              <li key={i} className="bg-white shadow p-4 rounded-lg text-sm flex items-start gap-2 border-l-4 border-amber-400 hover:shadow-lg transition transform hover:-translate-y-1">
                <FaBell className="text-amber-400 mt-1" />
                <span className="text-gray-800">{alert}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

// Sidebar Button
function SidebarButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left w-full transition ${active
        ? 'bg-green-700 text-white shadow'
        : 'text-gray-700 hover:bg-green-700 hover:text-white'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// Quick Action Button
function ActionButton({ icon, label, bg, onClick }) {
  const colors = {
    green: 'bg-green-700 hover:bg-green-800',
    blue: 'bg-blue-500 hover:bg-blue-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 text-white rounded-full shadow-md transition transform hover:-translate-y-1 ${colors[bg]}`}
    >
      {icon} {label}
    </button>
  );
}
