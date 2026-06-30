import { useState, useEffect } from "react";
import {
  FaTruck,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function VendorReport() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          return;
        }

        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${apiBaseUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch reports for this vendor.");

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching vendor orders:", err);
        setError(err.message || "Failed to fetch reports for this vendor.");
      }
    };

    fetchVendorOrders();
  }, []);

  const filtered = orders.filter(
    (order) => order.status === "Delivered" || order.status === "Confirmed"
  );

  const statusIcon = (status) => {
    if (status === "Delivered")
      return <FaCheckCircle className="text-blue-600" />;
    if (status === "Confirmed")
      return <FaClock className="text-sky-500 animate-pulse" />;
    return <FaTimesCircle className="text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-blue-800 mb-6 drop-shadow-sm">
          <FaClipboardList className="text-blue-600" /> Vendor QA Reports
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-6 border border-blue-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() =>
                navigate(`/qa-report/${order._id}`, {
                  state: { productType: order.itemsDescription },
                })
              }
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-blue-800">
                  {order.orderId || order._id}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  {statusIcon(order.status)} {order.status}
                </span>
              </div>

              <p className="text-gray-700 mb-2">
                <b>Procurement:</b> {order.createdBy?.name || "Manager"}
              </p>

              <p className="text-gray-700 mb-2">
                <b>Product:</b>{" "}
                {order.items
                  .map((item) => item.itemName)
                  .join(", ")
                  .replace(/\s*\(.*?\)\s*/g, "") || "N/A"}
              </p>

              <p className="text-gray-500 text-sm">
                <b>Date:</b>{" "}
                {new Date(order.date || order.createdAt).toLocaleDateString()}
              </p>

              <button
                className="mt-4 w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white py-2.5 rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/qa-report/${order._id}`, {
                    state: { productType: order.itemsDescription },
                  });
                }}
              >
                Analyze
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !error && (
          <p className="text-gray-500 text-center mt-20">
            No delivery records found.
          </p>
        )}
      </div>
    </div>
  );
}
