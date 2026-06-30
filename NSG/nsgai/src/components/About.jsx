import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Eye,
  Layers,
  Radar,
  Cpu,
  Database,
  Lock,
  AlertTriangle,
  Workflow,
  ScanLine
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0B0F14] to-[#070A0F] text-white">

      {/* ================= HEADER ================= */}
      <section className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <ShieldCheck size={14} />
            SYSTEM OVERVIEW
          </div>

          <h1 className="text-6xl font-extrabold leading-tight mb-6">
            Bharat Surveillance Grid
          </h1>

          <p className="text-gray-400 max-w-3xl text-lg leading-relaxed">
            Bharat Surveillance Grid is a centralized, AI-powered surveillance
            intelligence platform designed to observe, understand, and respond
            to real-world activities across multiple camera networks in real time.
            The system operates continuously, correlating events instead of reacting
            to isolated alerts.
          </p>
        </motion.div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-[#0E1420] border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold mb-16">
            How the System Works
          </h2>

          <div className="grid md:grid-cols-5 gap-8">
            <FlowCard icon={<Eye />} title="Observe" desc="Live video feeds are ingested from distributed camera sources in real time." />
            <FlowCard icon={<Layers />} title="Detect" desc="AI models identify people, objects, and movement patterns frame by frame." />
            <FlowCard icon={<Radar />} title="Analyze" desc="Behavior sequences are evaluated instead of single-frame events." />
            <FlowCard icon={<AlertTriangle />} title="Classify" desc="Threat levels are assigned based on priority and risk scoring." />
            <FlowCard icon={<ScanLine />} title="Persist" desc="High-risk entities remain under continuous observation." />
          </div>
        </div>
      </section>

      {/* ================= CORE ARCHITECTURE ================= */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-6">
          System Architecture
        </h2>

        <p className="text-gray-400 max-w-3xl mb-16">
          The platform is designed as a modular intelligence pipeline where
          each component operates independently yet contributes to a unified
          situational awareness model.
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          <ArchitectureCard
            icon={<Cpu className="text-blue-400" />}
            title="AI Processing Layer"
            desc="Performs real-time inference using optimized deep learning models for detection, tracking, and behavior analysis."
          />

          <ArchitectureCard
            icon={<Workflow className="text-yellow-400" />}
            title="Correlation Engine"
            desc="Links events across time and camera feeds to identify suspicious sequences and intent patterns."
          />

          <ArchitectureCard
            icon={<Database className="text-green-400" />}
            title="Intelligence Archive"
            desc="Stores events, timelines, and evidence in a structured, query-ready format for audits and investigations."
          />
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="bg-[#0E1420] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl font-bold mb-6">
              Security & Compliance
            </h2>

            <p className="text-gray-400 leading-relaxed mb-8">
              Bharat Surveillance Grid is designed with a zero-trust mindset.
              Every action is authenticated, authorized, logged, and preserved
              to maintain operational integrity.
            </p>

            <ul className="space-y-3 text-gray-400 text-sm">
              <li>• Role-based access control</li>
              <li>• Immutable event and evidence logs</li>
              <li>• Secure local or on-prem deployment</li>
              <li>• Tamper-resistant audit trails</li>
              <li>• Controlled operator access</li>
            </ul>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[#0B0F14] border border-white/10 rounded-2xl p-10"
          >
            <Lock size={32} className="text-red-500 mb-4" />
            <h3 className="font-bold text-xl mb-2">
              Restricted Intelligence Environment
            </h3>
            <p className="text-gray-400 text-sm">
              Designed exclusively for authorized personnel. All actions
              performed within the system are monitored and recorded.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#05080D] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xs opacity-60">
            Bharat Surveillance Grid — National Intelligence System
          </span>

          <span className="text-[10px] uppercase tracking-widest text-gray-600">
            System Overview • Classified Architecture • Continuous Monitoring
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function FlowCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-[#0B0F14] border border-white/10 rounded-xl p-6 text-center"
    >
      <div className="flex justify-center mb-4 text-red-500">{icon}</div>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-gray-400">{desc}</p>
    </motion.div>
  );
}

function ArchitectureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-[#0E1420] border border-white/10 rounded-2xl p-10"
    >
      <div className="mb-6">{icon}</div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}
