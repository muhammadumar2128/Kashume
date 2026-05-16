import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user: authUser } = await login(email, password);
      
      // Fetch profile to check is_admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError || !profile || !profile.is_admin) {
        await logout(); // Kick them out if not admin or profile missing
        throw new Error('Access denied. No admin profile found for this account.');
      }

      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to authenticate with the Sanctum');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gold/30" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-charcoal/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-ivory shadow-2xl p-12 relative z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif italic tracking-widest uppercase mb-4 text-charcoal">Kashume</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-[1px] bg-gold/40" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Admin Sanctum</p>
            <div className="w-8 h-[1px] bg-gold/40" />
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-red-50 border-l-2 border-red-500 flex items-center gap-3 text-red-700"
          >
            <AlertCircle size={16} />
            <span className="text-[10px] uppercase tracking-wider font-bold">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 block ml-1">Identity (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={16} strokeWidth={1.5} />
              <input 
                type="email" 
                required
                className="w-full border-b border-ivory pl-8 py-3 text-sm focus:border-gold outline-none bg-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="oracle@kashume.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 block ml-1">Key (Password)</label>
            <div className="relative group">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={16} strokeWidth={1.5} />
              <input 
                type="password" 
                required
                className="w-full border-b border-ivory pl-8 py-3 text-sm focus:border-gold outline-none bg-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-charcoal text-ivory py-5 text-[10px] uppercase tracking-[0.4em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin mx-auto" />
            ) : (
              <span className="relative z-10">Enter the Sanctum</span>
            )}
          </button>
        </form>

        <div className="mt-12 text-center pt-8 border-t border-ivory">
          <a href="/" className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30 hover:text-gold transition-colors">
            Return to the Gallery
          </a>
        </div>
      </motion.div>
      
      <p className="absolute bottom-8 text-[8px] uppercase tracking-[0.6em] text-charcoal/20">
        © 2024 House of Kashume • Proprietary Protocol
      </p>
    </div>
  );
};

export default Login;
