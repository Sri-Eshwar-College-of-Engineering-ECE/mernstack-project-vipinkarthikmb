import { useState, useEffect } from 'react';
import { FaBoxes, FaArrowLeft, FaSearch, FaFilter, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PlaceOrder() {
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    deliveryAddress: '',
    expectedDeliveryDate: '',
    notes: '',
  });

  const navigate = useNavigate();
  const categories = ['All', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Spices', 'Fruits'];

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const fetchVendorProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiBaseUrl}/api/inventory/vendor-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendorProducts(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = vendorProducts.filter(product => {
    const matchSearch = product.productName.toLowerCase().includes(search.toLowerCase()) ||
                        product.vendorCompanyName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchSearch && matchCategory && product.isAvailable && product.quantity > 0;
  });

  const openOrderForm = (product) => {
    setSelectedProduct(product);
    setFormData({
      quantity: '',
      deliveryAddress: '',
      expectedDeliveryDate: '',
      notes: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setFormData({
      quantity: '',
      deliveryAddress: '',
      expectedDeliveryDate: '',
      notes: '',
    });
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addToCart = () => {
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }
    if (quantity > selectedProduct.quantity) {
      alert(`Only ${selectedProduct.quantity} ${selectedProduct.unit} available.`);
      return;
    }
    if (!formData.deliveryAddress || !formData.expectedDeliveryDate) {
      alert('Please fill in delivery address and expected delivery date.');
      return;
    }

    const cartItem = {
      id: selectedProduct._id,
      productName: selectedProduct.productName,
      vendorName: selectedProduct.vendorName,
      vendorCompanyName: selectedProduct.vendorCompanyName,
      vendor: selectedProduct.vendor,
      quantity: quantity,
      unit: selectedProduct.unit,
      pricePerUnit: selectedProduct.pricePerUnit,
      totalPrice: quantity * selectedProduct.pricePerUnit,
      deliveryAddress: formData.deliveryAddress,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      notes: formData.notes
    };

    setCart(prev => [...prev, cartItem]);
    closeModal();
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart before placing order.');
      return;
    }
    setSubmittingOrder(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const ordersByVendor = cart.reduce((acc, item) => {
        const vendorId = item.vendor._id || item.vendor;
        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendor: vendorId,
            vendorName: item.vendorName,
            vendorCompanyName: item.vendorCompanyName,
            items: [],
            totalAmount: 0,
            deliveryAddress: item.deliveryAddress,
            expectedDeliveryDate: item.expectedDeliveryDate,
            notes: item.notes
          };
        }
        acc[vendorId].items.push({
          itemName: item.productName,
          category: item.category || 'General',
          quantity: item.quantity,
          unit: item.unit,
          pricePerUnit: item.pricePerUnit,
          totalPrice: item.totalPrice
        });
        acc[vendorId].totalAmount += item.totalPrice;
        return acc;
      }, {});

      const orderPromises = Object.values(ordersByVendor).map(orderData =>
        axios.post(`${apiBaseUrl}/api/orders`, { ...orderData, createdBy: userId }, { headers: { Authorization: `Bearer ${token}` } })
      );

      await Promise.all(orderPromises);
      alert(`Successfully placed ${Object.keys(ordersByVendor).length} order(s)!`);
      setCart([]);
      setShowCart(false);
      navigate('/procurementorders');

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="mt-2 px-3 py-1 bg-red-300 hover:bg-red-400 text-white rounded text-sm">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-green-700">
            <FaBoxes /> Place New Order
          </h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowCart(true)}
              className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow flex items-center gap-2 transition"
            >
              <FaShoppingCart /> Cart ({cart.length})
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow flex items-center gap-2 transition"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4 items-center flex-wrap">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search products or vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product._id} className="rounded-2xl bg-white text-gray-700 shadow-md p-5 hover:shadow-xl transition transform hover:scale-105">
                <h2 className="text-xl font-semibold text-green-700 mb-2">{product.productName}</h2>
                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <p>Category: <span className="text-gray-700">{product.category}</span></p>
                  <p>Vendor: <span className="font-medium text-gray-800">{product.vendorCompanyName}</span></p>
                  <p>Contact: <span className="text-gray-700">{product.vendorName}</span></p>
                  <p>Available: <span className="font-medium text-green-600">{product.quantity} {product.unit}</span></p>
                  <p>Price: <span className="font-bold text-yellow-500">₹{product.pricePerUnit}/{product.unit}</span></p>
                  {product.minOrderQuantity && <p>Min Order: <span className="text-gray-700">{product.minOrderQuantity} {product.unit}</span></p>}
                </div>
                {product.description && <p className="text-xs text-gray-400 mb-4 line-clamp-2">{product.description}</p>}
                <button
                  onClick={() => openOrderForm(product)}
                  className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 transition"
                >
                  <FaBoxes /> Add to Cart
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FaBoxes className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {vendorProducts.length === 0 ? 'No products available' : 'No products match your search'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add To Cart Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-700 p-6 rounded-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">Add to Cart</h2>
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <h3 className="font-semibold">{selectedProduct.productName}</h3>
              <p className="text-sm text-gray-600">Vendor: {selectedProduct.vendorCompanyName}</p>
              <p className="text-sm text-gray-600">Available: {selectedProduct.quantity} {selectedProduct.unit}</p>
              <p className="text-sm text-gray-600">Price: ₹{selectedProduct.pricePerUnit}/{selectedProduct.unit}</p>
            </div>

            <label className="block mb-2 font-medium">Quantity ({selectedProduct.unit})</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleFormChange}
              min={selectedProduct.minOrderQuantity || 1}
              max={selectedProduct.quantity}
              className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-green-500"
              placeholder={`Min: ${selectedProduct.minOrderQuantity || 1}, Max: ${selectedProduct.quantity}`}
            />

            <label className="block mb-2 font-medium">Delivery Address</label>
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleFormChange}
              className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Enter complete delivery address"
            />

            <label className="block mb-2 font-medium">Expected Delivery Date</label>
            <input
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleFormChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-green-500"
            />

            <label className="block mb-2 font-medium">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-green-500"
              rows="2"
              placeholder="Any special instructions or requirements"
            />

            {formData.quantity && (
              <div className="mb-4 p-3 bg-green-50 rounded">
                <p className="font-semibold text-green-700">
                  Total: ₹{(parseInt(formData.quantity) * selectedProduct.pricePerUnit).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition">Cancel</button>
              <button onClick={addToCart} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-700 p-6 rounded-xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-green-700">Shopping Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.productName}</h3>
                          <p className="text-sm text-gray-600">Vendor: {item.vendorCompanyName}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} {item.unit} × ₹{item.pricePerUnit} = ₹{item.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Delivery: {item.deliveryAddress}</p>
                          <p className="text-sm text-gray-600">Expected: {new Date(item.expectedDeliveryDate).toLocaleDateString()}</p>
                          {item.notes && <p className="text-sm text-gray-600">Notes: {item.notes}</p>}
                        </div>
                        <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700 ml-4">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold">
                      Total: ₹{cart.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {cart.length} item{cart.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button onClick={() => setShowCart(false)} className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition">Continue Shopping</button>
                    <button
                      onClick={submitOrder}
                      disabled={submittingOrder}
                      className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {submittingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
