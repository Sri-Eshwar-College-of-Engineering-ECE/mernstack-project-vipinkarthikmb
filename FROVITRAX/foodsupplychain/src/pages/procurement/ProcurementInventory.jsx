import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBoxes, FaSearch, FaAppleAlt, FaLeaf, FaFish, FaSeedling,
  FaCheese, FaArrowUp, FaArrowDown, FaCheckCircle, FaTruckLoading,
  FaWarehouse, FaClipboardCheck, FaPepperHot, FaTint
} from 'react-icons/fa';

const categoryIcons = {
  Grains: <FaSeedling />,
  Vegetables: <FaAppleAlt />,
  Dairy: <FaCheese />,
  Meat: <FaFish />,
  Seafood: <FaFish />,
  Spices: <FaPepperHot />,
  Oils: <FaTint />,
};

const categories = ['All', 'Grains', 'Vegetables', 'Dairy', 'Meat', 'Seafood', 'Spices', 'Oils'];

export default function ProcurementInventory() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please login.');
          return;
        }

        const queryParams = new URLSearchParams();
        if (filter !== 'All') queryParams.append('category', filter);

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await axios.get(
          `${apiBaseUrl}/api/inventory?${queryParams}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setItems(res.data);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError(`Failed to load inventory: ${err.response?.data?.message || err.message}`);
        }
      }
    };
    fetchInventory();
  }, [filter]);

  const filtered = items.filter(item => {
    const matchCat = filter === 'All' || item.category === filter;
    const matchSearch = (item.name || item.itemName || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-5 sm:px-10 py-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-3">
            <FaBoxes /> Procurement Inventory
          </h1>
          <div className="flex items-center mt-4 sm:mt-0">
            <div className="flex items-center bg-white rounded-full px-4 py-2 w-full sm:w-72 shadow border border-gray-300">
              <FaSearch className="text-green-700 mr-2" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full font-medium border ${
                filter === cat
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-400'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-green-100 hover:text-green-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item._id} className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-green-500 transition shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl text-green-700">
                  {categoryIcons[item.category] || <FaBoxes />}
                </div>
                <span className="text-xs text-gray-500">Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{item.name || item.itemName}</h3>
              <p className="text-sm text-gray-600 mb-1">Category: {item.category}</p>
              <p className="text-sm text-gray-600">Supplier: <span className="text-gray-900">{item.supplier || item.vendorName}</span></p>
              <p className="text-sm text-gray-600">Location: <span className="text-gray-900">{item.location || 'N/A'}</span></p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-green-700 font-bold text-lg">
                    {(item.stock || item.quantity || 0).toLocaleString()} {item.unit}
                  </p>
                  <p className="text-sm text-gray-700">
                    ₹{item.pricePerUnit || 0}/{item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Min: {item.minStockLevel || 0}</p>
                  <p className="text-xs text-gray-500">Max: {item.maxStockLevel || 0}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-semibold ${
                    (item.quantity || 0) > (item.minStockLevel || 0)
                      ? 'bg-green-700 text-white'
                      : (item.quantity || 0) > 0
                      ? 'bg-yellow-300 text-gray-900'
                      : 'bg-red-500 text-white'
                  }`}>
                    <FaCheckCircle />
                    {(item.quantity || 0) > (item.minStockLevel || 0)
                      ? 'In Stock'
                      : (item.quantity || 0) > 0
                      ? 'Low Stock'
                      : 'Out of Stock'
                    }
                  </span>
                  {item.expiryDate && (
                    <span className="text-xs text-gray-500">
                      Exp: {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 mt-10">
              No inventory items found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
