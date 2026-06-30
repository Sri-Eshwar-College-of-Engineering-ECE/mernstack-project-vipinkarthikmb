import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import YourLoginIllustration from "../assets/loginillustration2.png";
import FrovitraxLogoFull from "../assets/Frovitrax Logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await fetch(`${apiBaseUrl}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        const { token, role, userId } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userRole", role);
        navigate(
          role === "procurement" ? "/procurementdashboard" : "/vendordashboard"
        );
      } else {
        setError(data.message || data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Could not connect to server. Try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* LEFT SIDE - Illustration */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-emerald-50 overflow-hidden relative">
        <img
          src={YourLoginIllustration}
          alt="Login Illustration"
          className="w-[90%] h-[80%] object-cover rounded-[3rem] shadow-xl"
          style={{ borderRadius: "50px" }}
        />
      </div>

      {/* RIGHT SIDE - Full height white background */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white h-screen px-8 md:px-20">
        {/* Logo inside white section */}
        <img
          src={FrovitraxLogoFull}
          alt="Frovitrax Logo"
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full shadow-lg mb-6"
        />

        {/* Form container (can remove inner bg if you want fully unified) */}
        <div className="w-full max-w-md flex flex-col items-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back !</h2>
          <p className="text-gray-500 mb-8 text-sm text-center">
            To continue, please sign in using your email and password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="relative">
              <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
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
              <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login Now"}
            </button>
          </form>

          <div className="text-center mt-6">
  <p className="text-gray-600 text-sm">
    Don’t have an account?{" "}
    <Link
      to="/signup"
      className="font-semibold text-emerald-600 hover:text-teal-500 transition-colors duration-300"
    >
      Create Account
    </Link>
  </p>
</div>
        </div>
      </div>
    </div>
  );
}
