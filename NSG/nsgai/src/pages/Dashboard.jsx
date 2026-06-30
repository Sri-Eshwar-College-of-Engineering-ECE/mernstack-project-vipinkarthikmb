import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video,
  AlertTriangle,
  FileText,
  Radar,
  Shield,
  Bell,
  Activity,
  LayoutDashboard,
  Settings,
  LogOut,
  Zap,
  ShieldAlert,
  Map as MapIcon,
  Cpu,
  Globe,
  Server
} from "lucide-react";

export default function BSG_Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 flex overflow-hidden font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 border-r border-white/5 bg-[#05070A] flex flex-col z-50">
        <div className="p-6 border-b border-white/5 bg-red-950/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl text-white">
              BSG <span className="text-red-600">GRID</span>
            </span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={18} />} label="Command Center" path="/dashboard" location={location} navigate={navigate} />
          <SidebarLink icon={<Video size={18} />} label="Video Analysis" path="/videoanalysis" location={location} navigate={navigate} />
          <SidebarLink icon={<Bell size={18} />} label="Alert Logs" badge="4" path="/alerts" location={location} navigate={navigate} />
          <SidebarLink icon={<FileText size={18} />} label="Intelligence Reports" path="/reports" location={location} navigate={navigate} />
          <SidebarLink icon={<Settings size={18} />} label="Grid Settings" path="/settings" location={location} navigate={navigate} />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="mb-4 px-2">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Grid Integrity</p>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all text-sm font-bold"
          >
            <LogOut size={18} /> Disconnect
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-grow overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#0a1018_0%,_#020408_100%)]">
        
        <header className="sticky top-0 z-40 bg-[#020408]/60 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Encrypted Session</span>
                <span className="text-xs text-green-500 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> NODE_07_ACTIVE
                </span>
             </div>
          </div>

          <div className="flex items-center gap-8 font-mono">
            <div className="text-right border-r border-white/10 pr-6">
              <p className="text-[10px] text-gray-500 uppercase">Current Time (IST)</p>
              <p className="text-sm font-bold text-white">{currentTime.toLocaleTimeString()}</p>
            </div>
            <div className="relative cursor-pointer hover:text-red-500 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border-2 border-[#020408]" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Surveillance Overview</h2>
            <p className="text-gray-500 font-medium">Strategic Monitoring Hub • National Security Protocol 4-Alpha</p>
          </div>

          {/* TELEMETRY SECTION */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <TelemetryCard label="Global Feeds" value="1,284" icon={<Globe size={16} />} trend="+12" color="blue" />
            <TelemetryCard label="AI Accuracy" value="99.8%" icon={<Cpu size={16} />} trend="Stable" color="purple" />
            <TelemetryCard label="Threat Events" value="04" icon={<AlertTriangle size={16} />} trend="High" color="red" />
            <TelemetryCard label="Active Nodes" value="24" icon={<Server size={16} />} trend="Live" color="green" />
          </section>

          {/* DYNAMIC DASHBOARD CONTENT */}
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* LEFT: STRATEGIC MAP & GRID NODES */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#0A0C10] border border-white/5 rounded-3xl overflow-hidden relative group h-[450px]">
                {/* Tactical HUD Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none border-[20px] border-transparent group-hover:border-red-500/5 transition-all duration-700" />
                <div className="absolute top-6 left-6 z-20 flex gap-4">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">Active Sector</p>
                    <p className="text-lg font-black text-white italic">NCR_NORTH_01</p>
                  </div>
                </div>

                {/* The Map/Grid Visual */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
                
                {/* Visual Scanning Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-red-500/5" />
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-red-500/30 z-20 blur-sm" 
                />

                {/* Target Markers */}
                <div className="absolute top-1/2 left-1/3 z-20">
                  <TargetMarker label="Node_Alpha" status="warning" />
                </div>
                <div className="absolute top-1/4 left-2/3 z-20">
                  <TargetMarker label="Sector_P8" status="secure" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <ActionModule title="Aerial Recon" subtitle="3 Drones Active" icon={<Radar className="text-red-500" />} />
                <ActionModule title="Biometric Sync" subtitle="Database Online" icon={<Activity className="text-blue-500" />} />
                <ActionModule title="Network Mesh" subtitle="14 Latency (ms)" icon={<Zap className="text-yellow-500" />} />
              </div>
            </div>

            {/* RIGHT: INTELLIGENCE FEED */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0A0C10] border border-white/5 rounded-3xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                    <Radar size={14} className="text-red-500" /> Live Intel Stream
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono animate-pulse font-bold">REC ●</span>
                </div>
                
                <div className="space-y-4 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
                  <AlertItem time="14:20:01" msg="Unattended Object Identified" loc="Gate-4" type="alert" />
                  <AlertItem time="13:55:12" msg="Authorized VIP Entry" loc="Block-C" type="secure" />
                  <AlertItem time="13:40:45" msg="Network Node Rerouted" loc="System" type="neutral" />
                  <AlertItem time="12:10:33" msg="Crowd Surge Limit Reached" loc="Station" type="warning" />
                  <AlertItem time="11:45:10" msg="AI Model V4.2 Deployed" loc="Cloud" type="neutral" />
                  <AlertItem time="11:30:00" msg="Perimeter Breach Attempt" loc="Fence-North" type="alert" />
                </div>

                <button className="mt-auto w-full py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest text-white">
                  Full Tactical Log
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function TargetMarker({ label, status }) {
  return (
    <div className="flex flex-col items-center gap-1 group/marker cursor-pointer">
      <div className={`w-3 h-3 rounded-full ${status === 'warning' ? 'bg-red-500' : 'bg-green-500'} animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]`} />
      <span className="bg-black/80 backdrop-blur px-2 py-0.5 rounded text-[8px] font-bold text-white border border-white/10 opacity-0 group-hover/marker:opacity-100 transition-opacity">
        {label}
      </span>
    </div>
  );
}

function SidebarLink({ icon, label, path, navigate, location, badge }) {
  const active = location.pathname === path;
  return (
    <button
      onClick={() => navigate(path)}
      className={`flex w-full items-center justify-between p-3.5 rounded-xl transition-all
        ${active ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
    >
      <div className="flex items-center gap-3 text-sm font-bold tracking-tight uppercase">
        {icon} {label}
      </div>
      {badge && <span className="bg-white text-red-600 text-[10px] px-1.5 font-black rounded">{badge}</span>}
    </button>
  );
}

function TelemetryCard({ label, value, icon, trend, color }) {
  const colors = {
    blue: "text-blue-500 border-blue-500/20",
    red: "text-red-500 border-red-500/20",
    green: "text-green-500 border-green-500/20",
    purple: "text-purple-500 border-purple-500/20"
  };
  return (
    <div className={`bg-[#0A0C10] border ${colors[color]} p-5 rounded-2xl relative overflow-hidden group`}>
       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-black text-white italic tracking-tighter">{value}</div>
        <span className={`text-[10px] font-bold ${trend === 'High' ? 'text-red-500' : 'text-gray-400'}`}>{trend}</span>
      </div>
    </div>
  );
}

function ActionModule({ title, subtitle, icon }) {
  return (
    <div className="bg-[#0A0C10] border border-white/5 p-6 rounded-3xl hover:border-white/20 transition-all cursor-pointer group">
      <div className="mb-4 bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl group-hover:bg-red-600/10 transition-colors">
        {icon}
      </div>
      <h4 className="font-black text-xs uppercase tracking-widest text-white">{title}</h4>
      <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">{subtitle}</p>
    </div>
  );
}

function AlertItem({ time, msg, loc, type }) {
  const colors = {
    alert: "border-red-600 bg-red-600/5",
    secure: "border-green-600/30 bg-green-600/5",
    warning: "border-yellow-600/30 bg-yellow-600/5",
    neutral: "border-white/10 bg-white/5"
  };
  return (
    <div className={`p-4 border-l-2 rounded-r-xl ${colors[type]} transition-all hover:translate-x-1 cursor-default`}>
      <div className="flex justify-between items-center mb-1">
        <p className="text-[9px] font-mono font-bold text-gray-500 uppercase italic">{time} // {loc}</p>
      </div>
      <p className="text-[11px] font-bold tracking-tight text-white uppercase">{msg}</p>
    </div>
  );
}