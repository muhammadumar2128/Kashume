import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { ShoppingBag, Star, Info, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import LazyImage from '../components/ui/LazyImage';
import SEO from '../components/ui/SEO';

const Bundles = () => {
  const { dispatch } = useCart();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      // Don't fetch if Supabase is not configured
      if (import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        setBundles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_bundle', true);

        if (error || !data) {
          setBundles([]);
        } else {
          // Transform products that are bundles to the bundle format
          const dynamicBundles = data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price || p.price + 500, // Use DB value or fallback to hack
            description: p.description,
            image: p.images?.[0] || "/images/DATA 1.O/Bundles/1.png",
            items: p.scent_notes?.top || ["Limited Edition Ensemble"],
            benefit: p.shipping || "Complimentary Shipping"
          }));
          setBundles(dynamicBundles);
        }
      } catch (err) {
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const addToCart = (bundle) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...bundle, price: bundle.price } });
  };

  return (
    <main className="bg-[#FAF9F6] min-h-screen pt-40 pb-24 font-light">
      <SEO 
        title="Curated Collections | Bundle & Save" 
        description="Thoughtfully paired collections designed for those who seek to experience the full breadth of Kashume's artisanal distillations. Exceptional value, timeless scents."
      />
      <Navbar />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] text-gold mb-6 block">Curated Sets</span>
          <h1 className="text-5xl md:text-6xl font-light text-charcoal mb-8 tracking-tighter uppercase">Bundles</h1>
          <p className="text-charcoal/60 max-w-lg mx-auto text-sm font-light leading-relaxed">
            Thoughtfully paired collections designed for those who seek to experience the full breadth of Kashume's artisanal distillations.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gold" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {bundles.map((bundle, idx) => (
              <motion.div 
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                className="bg-white p-8 md:p-12 shadow-sm ring-1 ring-charcoal/5 flex flex-col md:flex-row gap-10 items-center rounded-3xl overflow-hidden"
              >
                <div className="w-full md:w-1/2 aspect-[4/5] overflow-hidden bg-[#F5F2ED] flex items-center justify-center p-4 rounded-2xl">
                  <LazyImage 
                    src={bundle.image} 
                    alt={bundle.name} 
                    containerClassName="w-full h-full"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-[2s]"
                  />
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4 text-gold">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Limited Offer</span>
                  </div>
                  
                  <h3 className="text-2xl font-serif italic mb-4 text-charcoal">{bundle.name}</h3>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-xl font-sans text-charcoal">Rs. {bundle.price}</span>
                    {bundle.originalPrice && <span className="text-sm font-sans text-charcoal/30 line-through">Rs. {bundle.originalPrice}</span>}
                  </div>
                  
                  <p className="text-xs text-charcoal/60 leading-relaxed mb-8">
                    {bundle.description}
                  </p>
                  
                  <ul className="mb-8 space-y-2">
                    {bundle.items && bundle.items.map(item => (
                      <li key={item} className="text-[10px] uppercase tracking-widest text-charcoal/80 flex items-center gap-2">
                        <div className="w-1 h-1 bg-gold rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gold/5 border border-gold/10 p-3 mb-8 text-center">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold">{bundle.benefit}</span>
                  </div>

                  <button 
                    onClick={() => addToCart(bundle)}
                    className="w-full bg-charcoal text-ivory py-4 uppercase tracking-[0.3em] text-[10px] hover:bg-gold transition-all flex items-center justify-center gap-3"
                  >
                    <ShoppingBag size={14} /> Add Bundle
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Bundles;
