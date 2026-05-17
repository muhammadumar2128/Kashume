import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { supabase } from '../lib/supabaseClient';
import { ShoppingBag, Truck, Award, Clock, Phone, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LazyImage from '../components/ui/LazyImage';
import SEO from '../components/ui/SEO';
import ReviewSection from '../components/shop/ReviewSection';

const BundleDetail = () => {
  const { id } = useParams();
  const { dispatch } = useCart();
  const { user, profile } = useAuth();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBundle(data);
      } catch (err) {
        console.error('Bundle fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBundle();
  }, [id]);

  useEffect(() => {
    if (bundle?.images && bundle.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bundle.images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [bundle?.images]);

  const addToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: bundle });
  };

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center"><div className="w-8 h-8 border border-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!bundle) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-light text-charcoal/40">Bundle not found.</div>;

  const displayImages = bundle.images?.length > 0 ? bundle.images : (bundle.image ? [bundle.image] : ["/images/DATA 1.O/Bundles/1.png"]);

  return (
    <main className="bg-[#FAF9F6] min-h-screen pt-32 pb-24 font-light">
      <SEO 
        title={`${bundle.name} | Curated Collection`}
        description={bundle.description?.slice(0, 160)}
        image={displayImages[0]}
      />
      <Navbar />
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Image Display */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] bg-white shadow-2xl shadow-charcoal/10 ring-1 ring-charcoal/15 rounded-3xl overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  <LazyImage 
                    src={displayImages[currentImageIndex]} 
                    alt={`${bundle.name} - View ${currentImageIndex + 1}`} 
                    containerClassName="w-full h-full"
                    className="w-full h-full object-contain p-8" 
                  />
                </motion.div>
              </AnimatePresence>
              
              {displayImages.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                  {displayImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-gold w-4' : 'bg-charcoal/20'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="absolute top-6 left-6 z-20">
              <span className="bg-charcoal text-white text-[8px] px-3 py-1.5 uppercase tracking-[0.3em] font-bold rounded-full shadow-xl ring-1 ring-white/10">
                Limited Collection
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block font-black">Bundle Savings</span>
              <h1 className="text-4xl md:text-5xl font-light text-charcoal mb-4 tracking-tighter uppercase leading-tight font-serif italic">{bundle.name}</h1>
              
              <div className="flex items-baseline gap-4 mb-8">
                <p className="text-2xl text-charcoal font-sans font-black">Rs. {bundle.price}</p>
                {bundle.original_price && (
                  <p className="text-sm text-charcoal/30 line-through font-bold font-sans">Rs. {bundle.original_price}</p>
                )}
              </div>
              
              <div className="text-base md:text-lg text-charcoal/90 mb-10 leading-relaxed max-w-md font-medium">
                <p>{bundle.description}</p>
              </div>

              {/* Items Included / Bundle Collection */}
              {bundle.bundle_items && bundle.bundle_items.length > 0 ? (
                <div className="mb-10 space-y-6">
                  <h3 className="text-xs uppercase tracking-widest font-black border-b border-charcoal/10 pb-2">The Ensemble Collection</h3>
                  <div className="space-y-6">
                    {bundle.bundle_items.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className="bg-[#F5F2ED] p-6 md:p-8 rounded-xl border border-charcoal/10 shadow-sm"
                      >
                        <h4 className="text-lg md:text-xl font-serif italic font-bold text-charcoal mb-3">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs md:text-sm text-charcoal/80 mb-5 leading-relaxed font-bold">{item.description}</p>
                        )}
                        
                        {(item.scent_notes?.top?.length > 0 || item.scent_notes?.heart?.length > 0 || item.scent_notes?.base?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-charcoal/10">
                            {item.scent_notes?.top?.length > 0 && (
                              <div>
                                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gold block font-black mb-1">Top Notes</span>
                                <p className="text-[10px] md:text-xs font-bold text-charcoal/80">{item.scent_notes.top.join(", ")}</p>
                              </div>
                            )}
                            {item.scent_notes?.heart?.length > 0 && (
                              <div>
                                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gold block font-black mb-1">Heart Notes</span>
                                <p className="text-[10px] md:text-xs font-bold text-charcoal/80">{item.scent_notes.heart.join(", ")}</p>
                              </div>
                            )}
                            {item.scent_notes?.base?.length > 0 && (
                              <div>
                                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gold block font-black mb-1">Base Notes</span>
                                <p className="text-[10px] md:text-xs font-bold text-charcoal/80">{item.scent_notes.base.join(", ")}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-10 space-y-6">
                  <h3 className="text-xs uppercase tracking-widest font-black border-b border-charcoal/10 pb-2">The Ensemble Includes</h3>
                  <ul className="grid grid-cols-1 gap-4">
                    {(bundle.scent_notes?.top || ["Signature Fragrance", "Artisanal Packaging"]).map((item, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className="text-sm md:text-base uppercase tracking-widest text-charcoal font-bold flex items-center gap-3"
                      >
                        <CheckCircle2 size={14} className="text-gold" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefit Badge */}
              <div className="mb-10 p-4 bg-gold/10 border-l-4 border-gold">
                 <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gold font-black block">Exclusive Protocol</span>
                 <p className="text-sm md:text-base text-charcoal/70 font-bold mt-1 uppercase tracking-widest">{bundle.shipping || "Complimentary Express Delivery"}</p>
              </div>

              <div className="flex flex-col gap-4 mb-10">
                <button 
                  onClick={addToCart}
                  className="w-full bg-charcoal text-ivory py-5 uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-3 font-bold shadow-2xl shadow-charcoal/30"
                >
                  <ShoppingBag size={14} strokeWidth={2} /> Acquire Collection
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[9px] text-charcoal/60 tracking-widest uppercase font-black">
                <Phone size={10} strokeWidth={3} /> Concierge: 0314 1754782
              </div>
            </motion.div>
          </div>
        </div>

        {/* Review Section */}
        <ReviewSection 
          productId={bundle.id} 
          userId={user?.id} 
          userName={profile?.full_name} 
        />
      </div>
    </main>
  );
};

export default BundleDetail;
