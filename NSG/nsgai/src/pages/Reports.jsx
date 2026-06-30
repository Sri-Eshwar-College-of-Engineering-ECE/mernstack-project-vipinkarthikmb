import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  CalendarDays, 
  Filter, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  ChevronRight,
  Database,
  Search
} from "lucide-react";

export default function BSG_Reports() {
  const [filter, setFilter] = useState("daily");
  const [isHovered, setIsHovered] = useState(null);

  // Simulated grid data for the heatmap
  const heatmapCells = Array.from({ length: 42 }, (_, i) => ({
    id: i,
    intensity: Math.floor(Math.random() * 5) + 1,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-8 font-sans selection:bg-red-500/30">
      
      {/* ================= HEADER AREA ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-white uppercase italic">
            <div className="p-2 bg-red-600 rounded shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <BarChart3 size={28} />
            </div>
            Intelligence Archives
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-2 tracking-widest uppercase italic">
            Bharat Surveillance Grid // Post-Incident Data Analysis
          </p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black px-8 py-4 rounded-full flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl hover:bg-red-600 hover:text-white transition-all duration-300"
        >
          <Download size={18} /> Export Tactical Report
        </motion.button>
      </div>

      {/* ================= CONTROL HUD ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-2 bg-[#0A0C12] border border-white/5 rounded-2xl mb-12 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex bg-black rounded-xl p-1 border border-white/5">
          {["daily", "weekly", "monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === t ? "bg-red-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 px-4">
          <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
            <CalendarDays size={16} className="text-red-500" />
            <span>03 JAN 2026 — 03 FEB 2026</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 transition-all">
            <Filter size={14} /> Advanced Filter
          </button>
        </div>
      </motion.div>

      {/* ================= AI SUMMARY CARDS ================= */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <ReportStatCard 
          title="Total Detections" 
          value="1,248" 
          trend="+12.5%" 
          desc="Entities indexed this period" 
          icon={<Database size={20} />} 
          color="blue" 
        />
        <ReportStatCard 
          title="Threat Alerts" 
          value="62" 
          trend="-2.1%" 
          desc="Confirmed weapon/loitering hits" 
          icon={<ShieldAlert size={20} />} 
          color="red" 
        />
        <ReportStatCard 
          title="AI Processing" 
          value="417h" 
          trend="Optimal" 
          desc="Uptime across all sectors" 
          icon={<Clock size={20} />} 
          color="green" 
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ================= HEATMAP SECTION ================= */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
            <TrendingUp size={20} className="text-red-500" /> Sector Heatmap
          </h2>
          <div className="bg-[#0A0C12] p-8 border border-white/5 rounded-3xl relative overflow-hidden group">
            <div className="grid grid-cols-7 gap-2">
              {heatmapCells.map((cell) => (
                <motion.div
                  key={cell.id}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  onHoverStart={() => setIsHovered(cell.id)}
                  onHoverEnd={() => setIsHovered(null)}
                  className={`h-10 w-full rounded-sm transition-all duration-500 cursor-crosshair border border-black/20
                    ${cell.intensity === 1 && "bg-emerald-900/40"} 
                    ${cell.intensity === 2 && "bg-yellow-700/40"} 
                    ${cell.intensity === 3 && "bg-orange-700/60"} 
                    ${cell.intensity === 4 && "bg-red-700/70"} 
                    ${cell.intensity === 5 && "bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]"} 
                  `}
                />
              ))}
            </div>
            <div className="mt-8 flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
              <span>Low Activity</span>
              <span>High Threat Density</span>
            </div>
          </div>
        </div>

        {/* ================= LOGS TABLE ================= */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
            <Search size={20} className="text-blue-500" /> Detection Logs
          </h2>
          <div className="bg-[#0A0C12] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <tr>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-6 py-5">Camera Node</th>
                  <th className="px-6 py-5">Activity</th>
                  <th className="px-6 py-5">Severity</th>
                  <th className="px-6 py-5 text-right">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <ReportRow time="12:41:03" cam="DRONE-03" act="Suspicious Vehicle" sev="HIGH" color="text-red-500" />
                <ReportRow time="10:22:15" cam="GATE-CAM-01" act="Crowd Anomaly" sev="MEDIUM" color="text-orange-500" />
                <ReportRow time="09:12:44" cam="PARK-WEST" act="Object Abandoned" sev="HIGH" color="text-red-400" />
                <ReportRow time="08:05:12" cam="ENTRY-NORTH" act="Loitering" sev="LOW" color="text-blue-500" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ABSTRACTIONS ================= */

function ReportStatCard({ title, value, trend, desc, icon, color }) {
  const glow = {
    blue: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:border-blue-500/30",
    red: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] group-hover:border-red-500/30",
    green: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:border-green-500/30"
  };

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={`bg-[#0A0C12] p-8 rounded-3xl border border-white/5 transition-all duration-500 group relative overflow-hidden ${glow[color]}`}
    >
      <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full transition-all duration-500 bg-current" />
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl bg-black border border-white/10 ${color === 'red' ? 'text-red-500' : color === 'blue' ? 'text-blue-500' : 'text-green-500'}`}>
          {icon}
        </div>
        <span className={`text-xs font-mono font-bold px-2 py-1 rounded bg-white/5 ${trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</div>
      <p className="text-[10px] text-gray-600 font-bold uppercase">{desc}</p>
    </motion.div>
  );
}

function ReportRow({ time, cam, act, sev, color }) {
  return (
    <motion.tr 
      whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      className="group transition-colors"
    >
      <td className="px-6 py-6 font-mono text-[11px] text-gray-400 italic">{time}</td>
      <td className="px-6 py-6 font-bold text-sm tracking-tight">{cam}</td>
      <td className="px-6 py-6 text-sm font-medium text-gray-300">{act}</td>
      <td className={`px-6 py-6 text-[10px] font-black tracking-widest ${color}`}>{sev}</td>
      <td className="px-6 py-6 text-right">
        <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-white/10 transition-all">
          <FileText size={12} /> Analysis
        </button>
      </td>
    </motion.tr>
  );
}