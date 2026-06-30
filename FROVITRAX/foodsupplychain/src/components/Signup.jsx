import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTie,
  FaTruck,
  FaChevronDown,
} from "react-icons/fa";

import SignUpBg from "../assets/signupbg.jpg";
import FrovitraxLogoFull from "../assets/Frovitrax Logo.png";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "procurement",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userRole", data.role);

      if (form.role === "procurement") {
        navigate("/procurementdetailsform", {
          state: { email: form.email, name: form.name },
        });
      } else {
        navigate("/vendordetailsform", {
          state: { email: form.email, name: form.name },
        });
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gray-50">
      {/* LEFT SIDE - Image with darker overlay and single-color text */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-emerald-100 overflow-hidden relative">
        <img
          src={SignUpBg}
          alt="Signup Illustration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-950/70" />

        {/* Text overlay */}
        <div className="absolute text-center px-10 animate-fadeIn">
          <h1 className="text-white text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Empower Your Supply Chain
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-xl mx-auto font-semibold leading-relaxed tracking-wide">
            Experience smarter collaboration, real-time insights, and
            <span className="text-lime-400 font-semibold">
              {" "}unified supply management
            </span>{" "}
            with <span className="text-white font-bold">Frovitrax</span> — transforming communication and efficiency across every link.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 bg-white">
        {/* Logo */}
        <img
          src={FrovitraxLogoFull}
          alt="Frovitrax Logo"
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full shadow-lg mb-6"
        />

        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-emerald-700 mb-3 text-center">
            Create Account
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Join Frovitrax and start your journey today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-emerald-500" />
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="relative">
              <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-emerald-500" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-emerald-500" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="relative">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition appearance-none"
              >
                <option value="procurement">Procurement Manager</option>
                <option value="vendor">Vendor Partner</option>
              </select>
              {form.role === "procurement" ? (
                <FaUserTie className="absolute top-1/2 left-3 transform -translate-y-1/2 text-emerald-500" />
              ) : (
                <FaTruck className="absolute top-1/2 left-3 transform -translate-y-1/2 text-emerald-500" />
              )}
              <FaChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-800 transition-colors duration-300"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
