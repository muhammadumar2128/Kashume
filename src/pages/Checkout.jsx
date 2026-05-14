import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';

const Checkout = () => {
  const { state, calculateTotals, dispatch } = useCart();
  const { total } = calculateTotals();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
    paymentMethod: 'COD' // Default to Cash on Delivery
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (state.items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customer_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        shipping_address: `${formData.address}, ${formData.city}`,
        phone: formData.phone,
        items: state.items,
        total: total,
        status: 'pending',
        payment_method: formData.paymentMethod
      };

      const { data, error: supabaseError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      // Clear cart after successful order
      state.items.forEach(item => {
        dispatch({ type: 'REMOVE_ITEM', payload: item.id });
      });
      
      // Navigate to success or home after 3 seconds
      setTimeout(() => {
        navigate('/');
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
          className="max-w-md w-full bg-white p-12 text-center shadow-2xl rounded-3xl"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif italic mb-4">Gratitude.</h2>
          <p className="text-charcoal/60 font-light leading-relaxed mb-8">
            Your essence has been reserved. A confirmation has been sent to your digital archive.
          </p>
          <div className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">
            Redirecting to Home...
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] pt-32 pb-24">
      <Navbar />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif italic text-charcoal tracking-tight font-bold">Checkout</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/70 mt-4 font-bold flex items-center gap-2">
            <span className="w-8 h-[1px] bg-charcoal/40" /> Finalizing your olfactory selection
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-12">
            <section className="space-y-8">
              <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b-2 border-gold/30 pb-4">Digital Identity</h3>
              <div className="space-y-6">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Digital Archive (Email)" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                />
              </div>
            </section>

            <section className="space-y-8">
              <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b-2 border-gold/30 pb-4">Shipping Protocol</h3>
              <div className="grid grid-cols-2 gap-6">
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="First Name" 
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                />
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Last Name" 
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-[#F5F2ED] border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none transition-all font-bold text-charcoal placeholder:text-charcoal/40"
                />
              </div>
              <input 
                type="text" 
                name="address"
                placeholder="Sanctum Address" 
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
                  placeholder="Contact Frequency (Phone)" 
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

          {/* Order Summary */}
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
              <div className="flex justify-between text-xs font-bold">
                <span className="text-charcoal/60 uppercase tracking-widest">Subtotal</span>
                <span className="text-charcoal">Rs. {total}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-charcoal/60 uppercase tracking-widest">Shipping Protocol</span>
                <span className="text-gold uppercase tracking-widest font-black">Complimentary</span>
              </div>
              <div className="flex justify-between text-2xl font-serif italic pt-6 border-t border-charcoal/5 text-charcoal font-bold">
                <span>Final Value</span>
                <span>Rs. {total}</span>
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
