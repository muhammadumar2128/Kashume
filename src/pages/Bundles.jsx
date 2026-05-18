import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { ShoppingBag, Star, Info, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import LazyImage from '../components/ui/LazyImage';
import SEO from '../components/ui/SEO';

const Bundles = () => {
  const { dispatch } = useCart();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      // Don't fetch if Supabase is not configured
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (!url || url.includes('placeholder')) {
        console.warn('Bundles: Supabase URL is missing or placeholder.');
        setBundles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .eq('is_bundle', true);

        if (error) {
          console.error('Bundles fetch error:', error);
          setBundles([]);
        } else if (!data) {
          console.warn('Bundles: No data returned from Supabase.');
          setBundles([]);
        } else {
          // Transform products that are bundles to the bundle format
          const dynamicBundles = data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price || p.price + 500, // Use DB value or fallback to hack
            description: p.description,
            image: p.images?.[0] || p.image,
            items: p.scent_notes?.top || ["Limited Edition Ensemble"],
            benefit: p.shipping || "Complimentary Shipping"
          }));          setBundles(dynamicBundles);
        }
      } catch (err) {
        console.error('Bundles unexpected error:', err);
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
                <Link to={`/bundle/${bundle.id}`} className="w-full md:w-1/2 block group/img">
                  <div className="relative aspect-[4/5] w-full max-w-[280px] mx-auto rounded-xl md:rounded-2xl overflow-hidden bg-white transition-all duration-700 group-hover/img:shadow-2xl group-hover/img:shadow-charcoal/10 ring-1 ring-charcoal/15">
                    <LazyImage 
                      src={bundle.image} 
                      alt={bundle.name} 
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/img:scale-110"
                    />
                  </div>
                </Link>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4 text-gold">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[9px] uppercase tracking-widest font-bold">Limited Offer</span>
                  </div>
                  
                  <Link to={`/bundle/${bundle.id}`}>
                    <h3 className="text-2xl md:text-3xl font-serif italic mb-4 text-charcoal hover:text-gold transition-colors font-bold">{bundle.name}</h3>
                  </Link>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-xl font-sans text-charcoal font-black">Rs. {bundle.price}</span>
                    {bundle.originalPrice && <span className="text-sm font-sans text-charcoal/30 line-through font-bold">Rs. {bundle.originalPrice}</span>}
                  </div>
                  
                  <p className="text-xs text-charcoal/60 leading-relaxed mb-8 font-medium italic">
                    {bundle.description}
                  </p>
                  
                  <ul className="mb-8 space-y-2">
                    {bundle.items && bundle.items.map(item => (
                      <li key={item} className="text-[10px] uppercase tracking-widest text-charcoal/80 flex items-center gap-3 font-bold">
                        <CheckCircle2 size={12} className="text-gold" /> {item}
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to={`/bundle/${bundle.id}`}
                    className="text-[9px] uppercase tracking-[0.3em] text-gold font-black mb-8 flex items-center gap-2 group/link"
                  >
                    View Protocol <ArrowRight size={12} className="group-hover/link:translate-x-2 transition-transform" />
                  </Link>

                  <button 
                    onClick={() => addToCart(bundle)}
                    className="w-full bg-charcoal text-ivory py-4 uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-3 font-bold shadow-xl shadow-charcoal/10"
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
