import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
const rolebased = '/images/rolebased.jpeg'
const Aisystem = '/images/aisystem.jpeg'
const eReceiptImage = '/images/money.png'
const Scalable = '/images/scalable.jpeg'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycling highlight for the steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#02040a] text-white selection:bg-teal-500/40">
      {/* 1. PROGRESS BAR */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600 origin-left z-[100]" style={{ scaleX }} />

      {/* 2. BACKGROUND ORBS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* 3. NAV BAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-teal-500 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(20,184,166,0.5)]">⚡</div>
            <span className="text-2xl font-black italic tracking-tighter">eMeterSeva</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[18px] font-black uppercase tracking-[0.2em] text-slate-400">
            <button onClick={() => navigate('/about')} className="hover:text-teal-400 transition-colors">About</button>
            <button onClick={() => navigate('/login')} className="hover:text-teal-400 transition-colors">Login</button>
            <button onClick={() => navigate('/signup')} className="bg-teal-500 text-black px-6 py-3 rounded-xl hover:bg-white transition-all shadow-lg">Register</button>
          </div>
        </div>
      </nav>

      {/* 4. HERO SECTION REFINED */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-24 sm:pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <span className="inline-block px-3 py-1 mb-6 text-[10px] font-black tracking-[0.4em] text-teal-400 uppercase bg-teal-400/10 border border-teal-400/20 rounded-md">
                Vision-Powered Intelligence
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[6rem] font-black leading-[0.9] md:leading-[0.85] tracking-tighter uppercase italic mb-6 sm:mb-8">
                The Power <br />
                <span className="stroke-text">of Vision.</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-xl leading-relaxed mb-10 border-l-4 border-teal-500 pl-6">
                eMeter Seva utilizes OCR to convert physical meter dials into verifiable digital data. Eliminate manual errors and automate your utility workflow instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={() => navigate('/signup')} className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-black font-black rounded-2xl hover:bg-teal-500 transition-all uppercase tracking-widest text-sm">Get Started</button>
                <button onClick={() => navigate('/login')} className="px-8 sm:px-10 py-4 sm:py-5 bg-slate-900 border border-white/10 font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-sm">Access Portal</button>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-teal-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { img: rolebased, label: "Role Based Access", color: "border-teal-500/30" },
                { img: Aisystem, label: "OCR Intelligence", color: "border-blue-500/30" },
                { img: eReceiptImage, label: "Instant Payments", color: "border-emerald-500/30" },
                { img: Scalable, label: "Auto Scalable", color: "border-purple-500/30" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`bg-slate-900/60 backdrop-blur-xl border ${item.color} p-8 rounded-[2.5rem] flex flex-col items-center shadow-2xl`}
                >
                  {item.img ? <img src={item.img} className="h-28 w-28 rounded-full object-cover mb-4" /> : <span className="text-5xl mb-4">{item.icon}</span>}
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC STEPS SECTION (WITH ARROW/LIGHT EFFECT) */}
      
      <section className="py-32 bg-[#050810] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black  italic tracking-tighter">eMeterSeva Billing Workflow</h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Animated Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 z-0">
               <motion.div 
                 animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
                 transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                 className="w-40 h-full bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_rgba(45,212,191,1)]"
               />
            </div>

            {[
              { title: "Capture", desc: "Our OCR engine isolates the meter display via high-speed scan.", icon: "📸" },
              { title: "Analyze", desc: "OCR parsing extracts the KWh digits with 99.9% precision.", icon: "⚙️" },
              { title: "Resolve", desc: "One-tap payment clearing with instant digital receipts.", icon: "💳" }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                animate={activeStep === idx ? { scale: 1.05, borderColor: "rgba(20,184,166,1)", backgroundColor: "rgba(20,184,166,0.05)" } : { scale: 1 }}
                className="relative z-10 p-12 rounded-[3rem] bg-black border border-white/5 transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 transition-colors ${activeStep === idx ? 'bg-teal-500 text-black' : 'bg-slate-900 text-white'}`}>
                  {step.icon}
                </div>
                <h4 className={`text-2xl font-black uppercase italic mb-4 ${activeStep === idx ? 'text-teal-400' : 'text-white'}`}>{step.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                
                {/* Arrow indicator for small screens */}
                {idx < 2 && (
                  <div className="md:hidden mt-8 flex justify-center">
                    <motion.span animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity }} className="text-teal-500">↓</motion.span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NEW: EFFICIENCY COMPARISON */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h3 className="text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none">Why Traditional <br /> Methods Fail</h3>
            <div className="space-y-6">
              {[
                { t: "Manual Entry Errors", d: "1 in 10 manual meter readings contain data entry errors." },
                { t: "Slow Processing", d: "Standard billing cycles take 15-30 days to resolve." },
                { t: "Paper Waste", d: "Millions of tons of carbon footprint from paper receipts." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-2xl hover:bg-white/5 transition-colors border-l-2 border-red-500/30">
                  <div className="text-red-500 font-black">✕</div>
                  <div>
                    <h5 className="font-black text-sm uppercase tracking-widest mb-1">{item.t}</h5>
                    <p className="text-slate-500 text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-1 rounded-[3rem]">
            <div className="bg-[#02040a] rounded-[2.9rem] p-12">
               <h3 className="text-3xl font-black uppercase italic mb-8 text-teal-400">The eMeter Seva Advantage</h3>
               <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase text-slate-400">Accuracy</span>
                    <span className="text-2xl font-black">99.9%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '99.9%' }} className="h-full bg-teal-500" />
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase text-slate-400">Speed</span>
                    <span className="text-2xl font-black">0.4s</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} className="h-full bg-blue-500" />
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase text-slate-400">Cost Savings</span>
                    <span className="text-2xl font-black">40%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '40%' }} className="h-full bg-emerald-500" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER CTA */}
      <section className="py-40 px-6">
        <motion.div 
          whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          className="max-w-6xl mx-auto bg-white rounded-[4rem] p-16 md:p-32 text-center text-black relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-teal-500" />
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-8">Ready for the <br /> Future?</h2>
          <p className="text-xl font-bold mb-12 max-w-xl mx-auto opacity-60 italic">Join the global network of smart meter management today.</p>
          <button onClick={() => navigate('/signup')} className="bg-black text-white px-16 py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">Create Free Account</button>
        </motion.div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">eMeter Seva Infrastructure © 2025</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.2);
          color: transparent;
        }
        @media (min-width: 1024px) {
          .stroke-text { -webkit-text-stroke: 3px rgba(255,255,255,0.4); }
        }
      `}} />
    </div>
  );
}

export default Landing;