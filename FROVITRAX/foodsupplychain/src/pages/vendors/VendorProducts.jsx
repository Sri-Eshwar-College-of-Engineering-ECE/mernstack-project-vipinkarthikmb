import { useState, useEffect } from 'react';
import {
  FaSearch,
  FaBox,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import axios from 'axios';

export default function VendorProducts() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    category: 'Vegetables',
    description: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    minOrderQuantity: '1',
    maxOrderQuantity: '',
    harvestDate: '',
    expiryDate: '',
    location: '',
    deliveryOptions: [],
  });

  const categories = [
    'All',
    'Vegetables',
    'Dairy',
    'Grains',
    'Meat',
    'Spices',
    'Fruits',
  ];
  const units = ['kg', 'liters', 'pieces', 'tons', 'boxes', 'bags'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiBaseUrl}/api/vendor/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((product) => {
    const matchCategory = filter === 'All' || product.category === filter;
    const matchSearch = (product.productName || '')
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    await axios.post(`${apiBaseUrl}/api/vendor/products`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowAddForm(false);
    fetchProducts();
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    await axios.put(
      `${apiBaseUrl}/api/vendor/products/${editingProduct._id}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('token');
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    await axios.delete(`${apiBaseUrl}/api/vendor/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  const resetForm = () =>
    setFormData({
      productName: '',
      category: 'Vegetables',
      description: '',
      quantity: '',
      unit: 'kg',
      pricePerUnit: '',
      minOrderQuantity: '1',
      maxOrderQuantity: '',
      harvestDate: '',
      expiryDate: '',
      location: '',
      deliveryOptions: [],
    });

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      category: product.category,
      description: product.description || '',
      quantity: product.quantity.toString(),
      unit: product.unit,
      pricePerUnit: product.pricePerUnit.toString(),
      minOrderQuantity: product.minOrderQuantity?.toString() || '1',
      maxOrderQuantity: product.maxOrderQuantity?.toString() || '',
      harvestDate: product.harvestDate?.split('T')[0] || '',
      expiryDate: product.expiryDate?.split('T')[0] || '',
      location: product.location || '',
      deliveryOptions: product.deliveryOptions || [],
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-emerald-50 to-pink-50">
        <div className="text-center text-gray-600">
          <div className="animate-spin h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-3 rounded-full"></div>
          Loading products...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-pink-50 p-8 text-gray-800">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-indigo-700">
          <FaBox /> My Products
        </h2>
        <div className="flex gap-4 flex-wrap items-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <FaPlus /> Add Product
          </button>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1 shadow-sm">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm ml-2 w-48"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'bg-white hover:bg-indigo-100 text-gray-700 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-indigo-50 text-indigo-700">
            <tr>
              {['Product', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length ? (
              filtered.map((p) => (
                <tr key={p._id} className="hover:bg-indigo-50 transition-all">
                  <td className="px-4 py-3">{p.productName}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.quantity} {p.unit}</td>
                  <td className="px-4 py-3">₹{p.pricePerUnit}/{p.unit}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3 text-indigo-600">
                      <button onClick={() => startEdit(p)} className="hover:text-blue-500"><FaEdit /></button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="hover:text-red-500"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6 text-sm">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-indigo-700">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  {units.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Price per Unit (₹)"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <input
                  type="number"
                  placeholder="Min Order Quantity"
                  value={formData.minOrderQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderQuantity: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
                >
                  <FaSave /> {editingProduct ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
