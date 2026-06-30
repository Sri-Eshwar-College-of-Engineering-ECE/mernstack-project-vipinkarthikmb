import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaBell,
  FaBox,
  FaClipboardList,
  FaCreditCard,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaMicrochip,
  FaClipboardCheck,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import FrovitraxLogo from '../../assets/Frovitrax Logo2.png';

export default function VendorDashboard() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [vendorName, setVendorName] = useState('Vendor Account');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchVendor();
    fetchStatsAndActivities();
  }, []);

  const fetchVendor = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.get(`${apiBaseUrl}/api/vendor/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendorName(res.data.ownerName || res.data.fullName || 'Vendor Account');
    } catch {
      setVendorName('Vendor Account');
    }
  };

  const fetchStatsAndActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const statsRes = await axios.get(`${apiBaseUrl}/api/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);

      const ordersRes = await axios.get(`${apiBaseUrl}/api/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activities = ordersRes.data
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(order => ({
          title: `Order #${order.orderId} ${order.status}`,
          description: `${order.items.length} item(s) for ${order.createdBy?.name || 'N/A'}`,
          date: order.updatedAt || order.createdAt,
        }));
      setRecentActivities(activities);
    } catch (err) {
      console.error('Failed to fetch stats or activities:', err);
    }
  };

  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white text-gray-800 min-h-screen font-sans transition-all duration-300">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen p-6 pt-0 fixed bg-white shadow-xl border-r border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-center items-center mt-0 pt-0 mb-6">
              <img
                src={FrovitraxLogo}
                alt="FROVITRAX Logo"
                className="w-54 h-24 object-contain block"
              />
            </div>

            <nav className="space-y-3">
              {[
                { to: '/vendorproducts', icon: <FaBox />, label: 'Products' },
                { to: '/vendororders', icon: <FaClipboardList />, label: 'Orders' },
                { to: '/vendorpayment', icon: <FaCreditCard />, label: 'Payments' },
                { to: '/vendevicetrack', icon: <FaMicrochip />, label: 'Device Track' },
                { to: '/vendorreport', icon: <FaClipboardCheck />, label: 'Reports' },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Profile Section at Bottom */}
          {/* Profile Section at Bottom */}
<div className="relative mb-6">
  {showProfileMenu && (
    <div className="absolute bottom-20 left-0 w-full rounded-lg shadow-lg border bg-white border-gray-200 z-50">
      <ul className="py-2">
        <li
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => (window.location.href = '/vendoraccount')}
        >
          <FaUser className="text-indigo-500" /> My Account
        </li>
        <li
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => (window.location.href = '/vendorsettings')}
        >
          <FaCog className="text-indigo-500" /> Settings
        </li>
        <li
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          <FaSignOutAlt /> Logout
        </li>
      </ul>
    </div>
  )}

  <div
    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-indigo-50 border border-gray-200 transition"
    onClick={toggleProfileMenu}
  >
    <FaUserCircle className="text-2xl text-indigo-500" />
    <div>
      <p className="font-medium">{vendorName}</p>
      <p className="text-sm text-gray-500">Manage profile</p>
    </div>
  </div>
</div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          <header className="flex justify-between items-center mb-10 p-4 rounded-xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold">Welcome back, {vendorName}! Manage your account below.</h2>
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-indigo-100 transition">
                <FaBell className="text-xl text-gray-600" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {recentActivities.length}
                </span>
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <FaClipboardList className="text-orange-500" />, title: 'Pending Orders', value: stats.pendingOrders },
                { icon: <FaBox className="text-blue-500" />, title: 'In Progress', value: stats.inProgressOrders },
                { icon: <FaClipboardCheck className="text-green-500" />, title: 'Delivered Orders', value: stats.deliveredOrders },
                { icon: <FaUser className="text-purple-500" />, title: 'Total Orders', value: stats.totalOrders },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-6 bg-white border border-gray-200 shadow hover:shadow-md transition">
                  <div className="flex items-center gap-4 mb-3">
                    {item.icon}
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-3xl font-bold">{item.value}</p>
                  <p className="text-sm text-gray-500 mt-1">View details in Orders tab</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="flex flex-col md:flex-row gap-6">
              {[
                {
                  to: '/vendorproducts',
                  color: 'bg-indigo-500 hover:bg-indigo-600',
                  icon: <FaBox />,
                  title: 'Manage Products',
                  desc: 'Update your supply list, pricing, and availability.',
                },
                {
                  to: '/vendororders',
                  color: 'bg-orange-500 hover:bg-orange-600',
                  icon: <FaClipboardList />,
                  title: 'View Orders',
                  desc: 'Track and fulfill incoming purchase orders.',
                },
                {
                  to: '/vendevicetrack',
                  color: 'bg-blue-500 hover:bg-blue-600',
                  icon: <FaMicrochip />,
                  title: 'Device Track',
                  desc: 'Monitor temperature & humidity sensors in transit boxes.',
                },
                {
                  to: '/vendorreport',
                  color: 'bg-purple-500 hover:bg-purple-600',
                  icon: <FaClipboardCheck />,
                  title: 'Reports',
                  desc: 'View QA and delivery reports for your shipments.',
                },
              ].map((card, i) => (
                <Link
                  key={i}
                  to={card.to}
                  className={`flex-1 rounded-xl p-8 text-white shadow-md transform hover:scale-[1.02] transition ${card.color}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl opacity-80">{card.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                      <p className="text-sm opacity-80">{card.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
              {recentActivities.length > 0 ? (
                recentActivities.map((act, idx) => (
                  <div key={idx} className="mb-3 border-b border-gray-100 pb-2 last:border-none">
                    <p className="font-medium">{act.title}</p>
                    <p className="text-sm text-gray-500">{act.description}</p>
                    <p className="text-xs text-gray-400">{new Date(act.date).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">Your recent activities will appear here</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
