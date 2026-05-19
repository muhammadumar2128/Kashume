import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle, User, ArrowRight, Phone } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(email, password, fullName, phone);
      
      // Track CompleteRegistration Pixel Event
      if (window.fbq) {
        window.fbq('track', 'CompleteRegistration', {
          content_name: 'User Registration'
        });
      }

      navigate('/account');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <Navbar />
      
      <div className="flex items-center justify-center p-6 pt-32 pb-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-charcoal/5 rounded-full blur-[120px]" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full max-w-md bg-white border border-ivory shadow-2xl p-8 md:p-12 relative z-10"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif italic tracking-widest uppercase mb-4 text-charcoal">Join the House</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-[1px] bg-gold/40" />
              <p className="text-[9px] uppercase tracking-[0.4em] text-gold font-bold">Create your profile</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 block ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={16} strokeWidth={1.5} />
                <input 
                  type="text" 
                  required
                  className="w-full border-b border-ivory pl-8 py-3 text-sm focus:border-gold outline-none bg-transparent transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 block ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={16} strokeWidth={1.5} />
                <input 
                  type="email" 
                  required
                  className="w-full border-b border-ivory pl-8 py-3 text-sm focus:border-gold outline-none bg-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 block ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={16} strokeWidth={1.5} />
                <input 
                  type="tel" 
                  required
                  className="w-full border-b border-ivory pl-8 py-3 text-sm focus:border-gold outline-none bg-transparent transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 block ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={16} strokeWidth={1.5} />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  className="w-full border-b border-ivory pl-8 py-3 text-sm focus:border-gold outline-none bg-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 block ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={16} strokeWidth={1.5} />
                <input 
                  type="password" 
                  required
                  className="w-full border-b border-ivory pl-8 py-3 text-sm focus:border-gold outline-none bg-transparent transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-charcoal text-ivory py-5 text-[10px] uppercase tracking-[0.4em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden mt-4"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin mx-auto" />
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Create Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-ivory">
            <p className="text-[10px] uppercase tracking-widest text-charcoal/40 mb-4">Already have an account?</p>
            <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold hover:text-charcoal transition-colors underline underline-offset-8 decoration-gold/30">
              Sign In Instead
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
