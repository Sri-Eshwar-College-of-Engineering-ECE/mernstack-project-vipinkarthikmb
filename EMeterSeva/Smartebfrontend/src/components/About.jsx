import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-teal-500/30 overflow-x-hidden">
      {/* Background Tech Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px]" />
      </div>

      {/* Industrial Header */}
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-teal-500 flex items-center justify-center rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <span className="text-black font-black">ES</span>
            </div>
            <h1 className="text-xl font-black text-[28px] tracking-tighter italic">About <span className="text-teal-500">eMeterSeva</span></h1>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-[18px] font-black uppercase tracking-[0.01em] text-slate-400 hover:text-white transition-colors"
          >
            Back
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Title Section */}
        <motion.div {...fadeInUp} className="mb-24">
          <span className="text-teal-500 font-black text-[10px] tracking-[0.5em] uppercase mb-4 block">System Specification v2.0</span>
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-8">
            The Digital <br /> <span className="text-transparent stroke-text">Infrastructure</span>
          </h2>
          <p className="text-slate-500 max-w-2xl text-lg font-medium leading-relaxed">
            eMeter Seva is a decentralized energy monitoring protocol designed to bridge the gap between legacy analog hardware and modern cloud accounting.
          </p>
        </motion.div>

        {/* Bento Grid Content */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Mission Card */}
          <motion.div 
            {...fadeInUp}
            className="md:col-span-8 bg-slate-900/40 border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-[12rem] leading-none font-black italic select-none">01</span>
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              The Objective
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed relative z-10">
              Our advanced <span className="text-white">OCR engine</span> eliminates the friction of manual utility reporting. By empowering users to act as their own data-entry point, eMeter Seva reduces official overhead by <span className="text-teal-400">85%</span> while ensuring that billing transparency is absolute and unalterable.
            </p>
          </motion.div>

          {/* Key Stats Card */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-teal-500 p-10 rounded-[2.5rem] flex flex-col justify-between"
          >
            <span className="text-black font-black text-4xl italic leading-none uppercase tracking-tighter">Real-Time Precision</span>
            <div className="space-y-4">
              <div className="border-t border-black/20 pt-4">
                <p className="text-black/60 text-[10px] font-black uppercase">OCR Accuracy</p>
                <p className="text-black text-3xl font-black italic">99.98%</p>
              </div>
              <div className="border-t border-black/20 pt-4">
                <p className="text-black/60 text-[10px] font-black uppercase">Processing Time</p>
                <p className="text-black text-3xl font-black italic">&lt; 0.4s</p>
              </div>
            </div>
          </motion.div>

          {/* Feature Bento Tiles */}
          {[
            { title: "Optical Logic", desc: "Machine learning models trained on 100k+ meter types.", icon: "🧠" },
            { title: "Secure Vault", desc: "AES-256 encryption for every consumer data point.", icon: "🔐" },
            { title: "Instant Clearing", desc: "Direct-to-bank API integration for e-receipts.", icon: "⚡" },
            { title: "Eco Protocol", desc: "100% paperless billing lifecycle.", icon: "🌱" }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="md:col-span-3 bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.08] transition-all group"
            >
              <div className="text-3xl mb-6 grayscale group-hover:grayscale-0 transition-all">{feature.icon}</div>
              <h4 className="font-black uppercase italic mb-2 tracking-tight">{feature.title}</h4>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}

          {/* How It Works Technical Section */}
          <motion.div 
            {...fadeInUp}
            className="md:col-span-12 bg-gradient-to-br from-slate-900 to-black border border-white/5 p-12 rounded-[3rem] mt-6"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black uppercase italic mb-6">Operational Flow</h3>
                <div className="space-y-8">
                  {[
                    { n: "01", t: "Authentication", d: "User handshake via secure consumer token." },
                    { n: "02", t: "Vision Capture", d: "Camera initializes OCR focus on meter dial." },
                    { n: "03", t: "Delta Calculation", d: "Difference between previous and current state computed." },
                    { n: "04", t: "Ledger Update", d: "Record written to central utility database." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6">
                      <span className="text-teal-500 font-black italic">{step.n}</span>
                      <div>
                        <h5 className="font-black text-sm uppercase tracking-widest text-white">{step.t}</h5>
                        <p className="text-slate-500 text-sm">{step.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square bg-white/5 rounded-full border border-white/10 flex items-center justify-center p-12 overflow-hidden">
                {/* Visual "Radar" Effect */}
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border-t border-teal-500/50 rounded-full"
                />
                <div className="text-center z-10">
                  <div className="text-6xl mb-4">⚙️</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-500">Processing Engine</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Future Scope Section */}
          <motion.div 
            {...fadeInUp}
            className="md:col-span-12 bg-white text-black p-12 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-10 mt-6"
          >
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Future Roadmaps</h3>
              <p className="font-bold opacity-70">Expanding into commercial industrial monitoring, predictive AI usage analytics, and multi-regional utility support.</p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">eMeter Seva Infrastructure © 2025</p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-white">Privacy Protocol</a>
            <a href="#" className="hover:text-white">Terms of Access</a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}} />
    </div>
  );
}

export default About;