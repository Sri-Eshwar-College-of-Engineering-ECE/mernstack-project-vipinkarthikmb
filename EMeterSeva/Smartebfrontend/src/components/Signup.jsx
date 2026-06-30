import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { signup } from '../api/authApi';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', fatherName: '', dob: '', email: '',
    password: '', address: '', phoneNo: '', role: 'citizen'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await signup(formData);
      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 via-transparent to-indigo-500/5" />
      </div>

      {/* Corner Accents */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-teal-500/30" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-teal-500/30" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all text-sm font-semibold"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Main Form Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-20 w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with Brand */}
        <div className="bg-gradient-to-r from-teal-600 to-indigo-600 px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2">
                eMeter<span className="text-teal-200">Seva</span>
              </h1>
              <p className="text-teal-100/80 text-sm font-medium">Create New Account</p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-teal-400/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-teal-300/30">
                <span className="text-white font-black text-2xl">ES</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Side Panel - Info Section */}
          <div className="lg:w-72 bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-8 border-r border-white/5 hidden lg:block">
            <h3 className="text-teal-400 text-sm font-bold mb-6 uppercase tracking-wide">Account Benefits</h3>
            <div className="space-y-6 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Real-time Monitoring</p>
                  <p className="text-xs text-slate-400">Track your energy consumption instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">AI-Powered OCR</p>
                  <p className="text-xs text-slate-400">Automatic meter reading extraction</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Digital Receipts</p>
                  <p className="text-xs text-slate-400">Download & share bill history</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Secure & Encrypted</p>
              <p className="text-xs text-slate-400 mt-2">Your data is protected with industry-standard encryption</p>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="flex-1 p-8 lg:p-12">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Registration Form
              </h2>
              <p className="text-slate-400 text-sm mt-1">Fill in your details to get started</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter your full name' },
                { label: "Father's Name", name: 'fatherName', type: 'text', placeholder: "Enter father's name" },
                { label: 'Date of Birth', name: 'dob', type: 'date' },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'user@example.com' },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Create a strong password' },
                { label: 'Phone Number', name: 'phoneNo', type: 'tel', placeholder: '10-digit mobile number' },
              ].map((f) => (
                <div key={f.name} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    {f.label}
                  </label>
                  <input
                    name={f.name} 
                    type={f.type} 
                    placeholder={f.placeholder} 
                    onChange={handleChange} 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
              ))}

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Address</label>
                <input
                  name="address" 
                  onChange={handleChange} 
                  placeholder="Enter your complete address"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Role</label>
                <select 
                  name="role" 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
                >
                  <option value="citizen" className="bg-slate-800">Citizen</option>
                  <option value="admin" className="bg-slate-800">Admin</option>
                </select>
              </div>

              <div className="flex items-end md:col-span-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-sm py-4 px-6 rounded-lg transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-teal-400 hover:text-teal-300 font-semibold hover:underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/50 px-8 py-4 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs">© 2025 eMeterSeva Infrastructure. Secure & Encrypted.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;