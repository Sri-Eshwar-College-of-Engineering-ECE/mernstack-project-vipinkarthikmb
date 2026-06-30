import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { login } from '../api/authApi';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login({ email, password });
      const { user, token } = res.data;
      const role = user.role;

      sessionStorage.setItem('userId', user.id);
      sessionStorage.setItem('userName', user.name);
      sessionStorage.setItem('userRole', role);
      if (token) {
        sessionStorage.setItem('token', token);
      }

      onLoginSuccess({ name: user.name, role: role, id: user.id });

      if (role === 'citizen') {
        navigate('/dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        alert('Invalid role');
      }
    } catch (err) {
      alert('Authentication Shield: Access Denied. Check Credentials.');
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

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-indigo-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <span className="text-white font-black text-2xl">ES</span>
            </div>
            <h1 className="text-3xl font-black  italic tracking-tighter text-white mb-2">
              eMeter<span className="text-teal-200">Seva</span>
            </h1>
            <p className="text-teal-100/80 text-sm font-medium">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="user@example.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Submit Button */}
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/signup')} 
                  className="text-teal-400 hover:text-teal-300 font-semibold hover:underline transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900/50 px-8 py-4 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs">© 2025 eMeterSeva Infrastructure</p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Secure Connection</span>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;