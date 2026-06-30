import { useEffect, useState } from 'react';
import {
  FaSearch,
  FaUserTie,
  FaTruck,
  FaPhone,
  FaWarehouse,
} from 'react-icons/fa';
import axios from 'axios';

const categories = ['All', 'Grains', 'Vegetables', 'Dairy', 'Spices'];

export default function ProcurementVendorsList() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please login.');
          setLoading(false);
          return;
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiBaseUrl}/api/vendor`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setVendors(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filtered = vendors.filter((vendor) => {
    const nameMatch = (vendor.businessName || vendor.ownerName || '').toLowerCase().includes(search.toLowerCase());
    const categoryMatch = filter === 'All' || (vendor.supplyCategories && vendor.supplyCategories.includes(filter));
    return nameMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaWarehouse className="text-green-600" /> Vendor Directory
          </h1>
        </div>

        {apiStatus && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded">
            <p className="text-sm text-gray-700">{apiStatus}</p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center w-full sm:w-1/2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow bg-transparent text-gray-800 placeholder:text-gray-400 outline-none text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1 rounded-full border text-sm transition duration-200 ${
                  filter === cat
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-green-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Cards */}
        {loading ? (
          <div className="text-center text-gray-500 mt-10">Loading vendors...</div>
        ) : error ? (
          <div className="text-center text-red-500 mt-10">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vendor) => (
              <div
                key={vendor._id}
                className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition duration-300 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl text-green-600">
                    {vendor.businessType === 'Farmer' ? <FaUserTie /> : <FaTruck />}
                  </div>
                  <span className="text-xs text-gray-500">{vendor.supplyCategories ? vendor.supplyCategories.join(', ') : ''}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{vendor.businessName}</h3>
                <p className="text-sm text-gray-600">Owner: {vendor.ownerName}</p>
                <p className="text-sm text-gray-600">Type: {vendor.businessType}</p>
                <p className="text-sm text-gray-500">Area: {vendor.operationalArea}</p>
                <p className="text-sm text-gray-500">Address: {vendor.address}</p>
                <p className="text-sm text-gray-500">License: {vendor.licenseNumber}</p>
                <p className="text-sm text-gray-500">Years: {vendor.years}</p>
                <p className="text-sm text-gray-500">Avg. Capacity: {vendor.avgCapacity}</p>
                <div className="mt-3 text-green-600 flex items-center gap-2 text-sm">
                  <FaPhone />
                  {vendor.contact?.phone || (typeof vendor.contact === 'string' ? vendor.contact : '')}
                  {vendor.contact?.email && (
                    <span className="ml-2 text-gray-500">{vendor.contact.email}</span>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-gray-500 mt-10">
                No vendors found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
