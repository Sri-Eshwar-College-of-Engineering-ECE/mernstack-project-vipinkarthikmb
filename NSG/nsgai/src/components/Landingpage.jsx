import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Activity,
  AlertTriangle,
  UserSearch,
  PackageSearch,
  Radar,
  Cpu,
  Lock,
  ChevronRight,
  Eye,
  Layers,
  Clock,
  Database
} from 'lucide-react';

export default function BharatSurveillanceGrid() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0B0F14] to-[#070A0F] text-white font-sans">

      {/* ================= TOP COMMAND BAR ================= */}
      <nav className="sticky top-0 z-50 bg-[#0E1420]/80 backdrop-blur border-b border-white/10 px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-900/40">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="font-extrabold tracking-wide text-lg">
              BHARAT SURVEILLANCE GRID
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">
              Central Intelligence Monitoring System
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 bg-white text-black px-7 py-2.5 rounded-md font-bold text-sm hover:bg-gray-200 transition"
        >
          <Lock size={16} />
          Authorized Login
        </button>
      </nav>

      {/* ================= HERO / INTRO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold mb-8">
              <Activity size={14} />
              NATIONAL SURVEILLANCE ACTIVE
            </div>

            <h2 className="text-6xl font-extrabold leading-tight mb-8">
              Intelligent Surveillance
              <br />
              <span className="text-gray-500">
                That Thinks Ahead
              </span>
            </h2>

            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">
              Bharat Surveillance Grid is a secure, AI-powered desktop platform
              designed to continuously observe live video feeds, interpret human
              behavior, track objects, and detect suspicious activity patterns
              across critical environments — in real time.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-red-900/40"
              >
                Enter Command Center
                <ChevronRight size={18} />
              </button>

              <button onClick={() => navigate('/about')}
              className="border border-white/20 px-8 py-4 rounded-lg font-semibold text-sm hover:bg-white/5 transition">
                System Overview
              </button>
            </div>
          </motion.div>

          {/* ================= HERO VISUAL ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative bg-[#0E1420] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3 border-b border-white/10 text-xs text-gray-400 flex justify-between">
              <span>LIVE FEED ANALYSIS — SECTOR 12</span>
              <span className="text-red-500 animate-pulse">● ACTIVE</span>
            </div>

           <img
    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80"
    className="h-full w-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 ease-in-out scale-105 group-hover:scale-100"
    alt="Grid Strategic Overview"
  />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl px-8 py-5 text-center">
                <AlertTriangle size={34} className="text-red-500 mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest">
                  Behavioral Anomaly Detected
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= CORE MODULES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h3 className="text-3xl font-bold mb-4">
          Core Intelligence Modules
        </h3>
        <p className="text-gray-500 mb-16 max-w-2xl">
          Each module operates continuously, correlating data across cameras
          to build a real-time intelligence picture instead of isolated alerts.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <ModuleCard
            icon={<UserSearch className="text-blue-400" />}
            title="Person Identification & Tracking"
            desc="Detects individuals, assigns unique identities, and continuously tracks movement across multiple camera zones without manual intervention."
          />

          <ModuleCard
            icon={<PackageSearch className="text-yellow-400" />}
            title="Unattended Object Intelligence"
            desc="Monitors object placement, dwell time, and owner association. Objects left beyond acceptable thresholds are escalated automatically."
          />

          <ModuleCard
            icon={<Radar className="text-red-400" />}
            title="Threat Priority Engine"
            desc="Analyzes behavior sequences and assigns threat levels, ensuring high-risk entities receive maximum system focus."
          />
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-[#0E1420] border-t border-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h3 className="text-3xl font-bold mb-16">
            Surveillance Intelligence Workflow
          </h3>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard icon={<Eye />} title="Observe" desc="Live video streams are continuously ingested and analyzed frame by frame." />
            <StepCard icon={<Layers />} title="Understand" desc="AI models interpret movement, behavior, and object interactions." />
            <StepCard icon={<Clock />} title="Correlate" desc="Events are linked over time to detect suspicious sequences." />
            <StepCard icon={<AlertTriangle />} title="Respond" desc="Threats are classified, logged, and escalated instantly." />
          </div>
        </div>
      </section>

      {/* ================= DATA & AUDIT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6">
              Evidence-Driven Intelligence
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Every detection, alert, and decision is time-stamped and preserved.
              The system builds a complete digital trail that supports review,
              audit, and investigation workflows.
            </p>

            <ul className="space-y-3 text-gray-400 text-sm">
              <li>• Event timelines with frame-level precision</li>
              <li>• Automatic suspect prioritization logs</li>
              <li>• Object-person association records</li>
              <li>• Secure, tamper-resistant storage</li>
            </ul>
          </div>

          <div className="bg-[#0E1420] border border-white/10 rounded-2xl p-10">
            <Database className="text-green-400 mb-4" size={28} />
            <h4 className="font-bold text-lg mb-2">Central Intelligence Archive</h4>
            <p className="text-gray-400 text-sm">
              All surveillance intelligence is preserved in a structured,
              query-ready format to support long-term analysis and pattern discovery.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#05080D] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-60">
            <Cpu size={18} />
            <span className="text-xs">
              Bharat Surveillance Grid — Secure Desktop Intelligence Platform
            </span>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-gray-600 text-center">
            Restricted Access • Continuous Monitoring • Audit Enabled
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function ModuleCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0E1420] border border-white/10 rounded-2xl p-10 shadow-xl"
    >
      <div className="mb-6">{icon}</div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StepCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-[#0B0F14] border border-white/10 rounded-xl p-8 text-center"
    >
      <div className="flex justify-center mb-4 text-red-500">{icon}</div>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-gray-400">{desc}</p>
    </motion.div>
  );
}
