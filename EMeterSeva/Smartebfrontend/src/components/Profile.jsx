import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import httpClient from '../api/httpClient';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

function Profile({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    httpClient.get(`/auth/${userId}`)
      .then(res => setUser(res.data))
      .catch(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login');
      });
  }, [navigate]);

  const logout = () => {
    if (onLogout) onLogout();
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#02040a] text-white flex items-center justify-center">
        <span className="text-xs tracking-[0.4em] uppercase text-slate-500">
          Loading Profile…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-black">ES</span>
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tight">
              System <span className="text-teal-500">Profile</span>
            </h1>
          </div>

          <button
            onClick={logout}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition"
          >
            Logout →
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <motion.div {...fadeInUp} className="mb-20">
          <span className="text-teal-500 text-[10px] font-black tracking-[0.5em] uppercase">
            User Identity Node
          </span>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mt-6">
            Account <span className="stroke-text">Details</span>
          </h2>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-10 bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12"
        >
          <ProfileRow label="User Name" value={user.name} />
          <ProfileRow label="Email Address" value={user.email} />
          <ProfileRow label="Contact Number" value={user.phoneNo} />
          <ProfileRow label="Registered Address" value={user.address} />
        </motion.div>

        {/* Info Note */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.2 }}
          className="mt-16 bg-white text-black rounded-[2rem] p-10"
        >
          <h3 className="text-2xl font-black uppercase italic mb-4">
            Access Control
          </h3>
          <p className="font-bold opacity-70 max-w-2xl">
            Profile attributes are locked to preserve ledger integrity.  
            Any modification requires administrator authorization.
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
        eMeter Seva Infrastructure © 2025
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.35);
          color: transparent;
        }
      `}} />
    </div>
  );
}

const ProfileRow = ({ label, value }) => (
  <div className="border-b border-white/10 pb-6">
    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-2">
      {label}
    </p>
    <p className="text-xl font-black tracking-tight">
      {value || 'Not Available'}
    </p>
  </div>
);

export default Profile;
