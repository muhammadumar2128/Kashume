import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/layout/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, ShoppingBag, MapPin, User as UserIcon } from 'lucide-react';

const Checkout = () => {
  const { state, calculateTotals, dispatch } = useCart();
  const { user, profile } = useAuth();
  const { subtotal, total, shipping } = calculateTotals();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState(null);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: profile?.full_name || '',
    address: '',
    city: '',
    phone: profile?.phone || '',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
      setFormData(prev => ({
        ...prev,
        email: user.email,
        fullName: profile?.full_name || '',
        phone: profile?.phone || ''
      }));
    }
  }, [user, profile]);

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    
    if (data) {
      setSavedAddresses(data);
      const defaultAddr = data.find(a => a.is_default) || data[0];
      if (defaultAddr) {
        handleSelectAddress(defaultAddr);
      }
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData(prev => ({
      ...prev,
      fullName: addr.full_name,
      phone: addr.phone,
      address: addr.street_address,
      city: addr.city
    }));
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('promocodes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .single();

      if (fetchError || !data) {
        throw new Error('Invalid or expired token.');
      }

      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        throw new Error('Token has expired.');
      }

      if (data.usage_limit && data.times_used >= data.usage_limit) {
        throw new Error('Token usage limit reached.');
      }

      setAppliedPromo(data);
    } catch (err) {
      setPromoError(err.message);
      setAppliedPromo(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const discountAmount = appliedPromo ? (subtotal * (appliedPromo.discount / 100)) : 0;
  const finalTotal = total - discountAmount;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (selectedAddressId) setSelectedAddressId(null); // Reset selection if manually editing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state.items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customer_email: formData.email,
        customer_name: formData.fullName,
        shipping_address: `${formData.address}, ${formData.city}`,
        phone: formData.phone,
        items: state.items,
        total: finalTotal,
        status: 'pending',
        payment_method: formData.paymentMethod,
        promo_applied: appliedPromo?.code || null,
        user_id: user?.id || null
      };

      const { data, error: supabaseError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (supabaseError) throw supabaseError;

      // Send Order Confirmation Emails via Vercel Serverless Function
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: {
              ...data[0],
              subtotal,
              shipping,
              discountAmount,
              promo_applied: appliedPromo?.code || null
            },
            type: 'order_confirmation'
          })
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // We don't throw here to avoid failing the order if only email fails
      }

      if (appliedPromo) {
        await supabase
          .from('promocodes')
          .update({ times_used: appliedPromo.times_used + 1 })
          .eq('id', appliedPromo.id);
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      state.items.forEach(item => {
        dispatch({ type: 'REMOVE_ITEM', payload: item.id });
      });
      
      setTimeout(() => {
        navigate(user ? '/account' : '/');
      }, 5000);

    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err.message || "An error occurred during checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 text-center shadow-2xl rounded-3xl border border-ivory"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif italic mb-4">Gratitude.</h2>
          <p className="text-charcoal/60 font-light leading-relaxed mb-8">
            Your order has been successfully placed. A confirmation email has been sent to you.
          </p>
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">
            Redirecting to {user ? 'Your Account' : 'Home'}...
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] pt-32 pb-24">
      <Navbar />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-charcoal tracking-tight font-bold">Checkout</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/70 mt-4 font-bold flex items-center gap-2">
              <span className="w-8 h-[1px] bg-charcoal/40" /> Finalizing your olfactory selection
            </p>
          </div>
          {!user && (
            <div className="bg-white border border-gold/20 p-4 px-6 rounded-2xl flex items-center gap-4 shadow-sm">
              <UserIcon size={20} className="text-gold" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Returning Client?</p>
                <Link to="/login" className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold hover:text-charcoal transition-colors">Sign in for faster checkout</Link>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            {/* Saved Addresses Section */}
            {user && savedAddresses.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b-2 border-gold/30 pb-4 flex items-center gap-2">
                  <MapPin size={14} /> Saved Sanctuaries
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-4 text-left border transition-all duration-500 rounded-xl relative ${
                        selectedAddressId === addr.id 
                          ? 'border-gold bg-gold/5 ring-1 ring-gold shadow-lg shadow-gold/5' 
                          : 'border-ivory bg-white hover:border-gold/40'
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gold mb-2">{addr.title}</p>
                      <p className="text-[11px] font-bold text-charcoal truncate">{addr.full_name}</p>
                      <p className="text-[10px] text-charcoal/60 truncate">{addr.street_address}</p>
                      {selectedAddressId === addr.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 size={12} className="text-gold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              <section className="space-y-8">
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b-2 border-gold/30 pb-4">Digital Identity</h3>
                <div className="space-y-6">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email Address" 
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                  />
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b-2 border-gold/30 pb-4">Shipping Protocol</h3>
                <div className="space-y-6">
                  <input 
                    type="text" 
                    name="fullName"
                    placeholder="Full Name" 
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                  />
                </div>
                <input 
                  type="text" 
                  name="address"
                  placeholder="Shipping Address" 
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                />
                <div className="grid grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    name="city"
                    placeholder="City" 
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                  />
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="Phone Number" 
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                  />
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b-2 border-gold/30 pb-4">Exchange Protocol</h3>
                <div className="flex gap-6">
                  <label className={`flex-1 p-6 border-2 transition-all cursor-pointer rounded-2xl ${formData.paymentMethod === 'COD' ? 'border-gold bg-gold/10 shadow-lg shadow-gold/5' : 'border-charcoal/10 hover:border-charcoal/30'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleInputChange}
                      className="hidden" 
                    />
                    <div className="text-[10px] uppercase tracking-widest font-black mb-2 text-charcoal">Cash on Delivery</div>
                    <p className="text-[10px] text-charcoal/70 font-bold italic">Pay upon receiving the essence.</p>
                  </label>
                </div>
              </section>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs rounded-xl border-2 border-red-200 font-bold italic">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || state.items.length === 0}
                className="w-full bg-charcoal text-ivory py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl flex items-center justify-center gap-4 group font-black"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Confirm Order <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>

          <aside className="lg:sticky lg:top-32 h-fit bg-white p-12 rounded-3xl shadow-2xl shadow-charcoal/10 space-y-8 border-2 border-charcoal/5">
            <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b-2 border-gold/30 pb-4">Your Selection</h3>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-6">
                  <div className="w-16 h-20 bg-[#FAF9F6] rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-charcoal/10">
                    <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover grayscale-[10%]" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm font-serif italic text-charcoal font-bold">{item.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-charcoal/60 uppercase tracking-widest font-bold">Qty: {item.quantity}</span>
                      <span className="text-xs font-sans font-black">Rs. {item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t-2 border-charcoal/10">
              <div className="pt-2 pb-6 border-b border-charcoal/5">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Scent Token (Promo)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={appliedPromo}
                    className="flex-1 bg-[#F5F2ED] border-b border-charcoal/20 p-3 text-[10px] uppercase tracking-widest outline-none focus:border-gold transition-all font-bold disabled:opacity-50"
                  />
                  {!appliedPromo ? (
                    <button 
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCode}
                      className="bg-charcoal text-ivory px-4 py-2 text-[8px] uppercase tracking-[0.2em] font-black hover:bg-gold hover:text-charcoal transition-all disabled:opacity-50"
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCode('');
                      }}
                      className="text-[8px] uppercase tracking-[0.2em] font-black text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {promoError && <p className="text-[8px] text-red-500 mt-2 font-bold italic">{promoError}</p>}
                {appliedPromo && <p className="text-[8px] text-green-600 mt-2 font-bold italic">Token Applied: {appliedPromo.discount}% OFF</p>}
              </div>

              <div className="flex justify-between text-xs font-bold">
                <span className="text-charcoal/60 uppercase tracking-widest">Subtotal</span>
                <span className="text-charcoal">Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-charcoal/60 uppercase tracking-widest">Shipping Protocol</span>
                <span className="text-gold uppercase tracking-widest font-black">
                  {shipping === 0 ? 'Complimentary' : `Rs. ${shipping}`}
                </span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-xs font-bold text-green-600 italic">
                  <span className="uppercase tracking-widest">Scent Discount ({appliedPromo.discount}%)</span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-2xl font-serif italic pt-6 border-t border-charcoal/5 text-charcoal font-bold">
                <span>Final Value</span>
                <span>Rs. {finalTotal}</span>
              </div>
            </div>
            
            <div className="p-6 bg-gold/10 border-2 border-gold/20 rounded-2xl flex gap-4">
              <ShoppingBag size={20} className="text-gold shrink-0 stroke-[2.5]" />
              <p className="text-[10px] text-gold/80 leading-relaxed font-bold italic">
                Our distillations are protected in signature Kashume archives to ensure absolute botanical integrity during transport.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
