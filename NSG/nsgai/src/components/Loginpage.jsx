import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();

  const [operatorId, setOperatorId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          operatorId,
          password,
        }
      );

      localStorage.setItem("nsg_token", res.data.token);
      localStorage.setItem("nsg_user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070B] text-white">

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* GLOW ORBS */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md px-10 py-12 rounded-2xl bg-[#0C111A]/80 backdrop-blur-xl border border-white/10"
        >

          {/* HEADER */}
          <div className="flex flex-col items-center mb-10">
            <div className="p-4 rounded-xl bg-red-600/20 border border-red-500/30 mb-4">
              <ShieldCheck size={32} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider">
              SECURE ACCESS
            </h1>
            <p className="text-xs mt-2 text-gray-400 tracking-widest uppercase">
              Authorized Personnel Only
            </p>
          </div>

          {/* INPUTS */}
          <div className="space-y-6">

            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Operator ID"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 focus:border-red-500/50 outline-none text-sm"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Encryption Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 focus:border-red-500/50 outline-none text-sm"
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="mt-4 text-xs text-red-500 text-center tracking-wide">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            onClick={handleLogin}
            className="w-full mt-10 py-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold tracking-widest uppercase text-sm disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </motion.button>

          <div className="mt-8 text-center text-[10px] tracking-widest text-gray-500 uppercase">
            Activity Logged • Secure Channel • Zero Trust
          </div>

        </motion.div>
      </div>

      {/* SCAN LINE */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent"
      />
    </div>
  );
}
