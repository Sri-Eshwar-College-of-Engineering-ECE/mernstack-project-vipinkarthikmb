import { useState, useEffect } from "react";
import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaClipboardCheck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ProcurementReport() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please login.");
          return;
        }

        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${apiBaseUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders");
      }
    };
    fetchOrders();
  }, []);

  // Filter only Delivered or Confirmed orders
  const filtered = orders.filter(
    (order) => order.status === "Delivered" || order.status === "Confirmed"
  );

  const statusIcon = (status) => {
    if (status === "Delivered") return <FaCheckCircle className="text-green-500" />;
    if (status === "Confirmed") return <FaClock className="text-blue-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-emerald-700 mb-6">
          <FaClipboardCheck /> Delivered & Confirmed Orders
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((order) => (
           <div
  key={order._id}
  className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-2xl transition cursor-pointer"
>
  <div className="flex justify-between items-center mb-3">
    <span className="font-bold text-gray-800">{order.orderId || order._id}</span>
    <span className="flex items-center gap-1">{statusIcon(order.status)} {order.status}</span>
  </div>
  <p className="text-gray-600 mb-2"><b>Vendor:</b> {order.vendorCompanyName || order.vendorName}</p>
  <p className="text-gray-600 mb-2"><b>Items:</b> {order.itemsDescription || "Multiple items"}</p>
  <p className="text-gray-500 text-sm"><b>Date:</b> {new Date(order.date || order.createdAt).toLocaleDateString()}</p>

  <button
    className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition"
    onClick={() =>
      navigate(`/qa-report/${order._id}`, {
        state: { productType: order.itemsDescription || "Unknown" },
      })
    }
  >
    Analyze
  </button>
</div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-gray-500 text-center mt-20">No Delivered or Confirmed orders found.</p>
        )}
      </div>
    </div>
  );
}
