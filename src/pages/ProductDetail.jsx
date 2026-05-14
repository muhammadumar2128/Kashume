import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { supabase } from '../lib/supabaseClient';
import { ShoppingBag, Truck, ShieldCheck, Clock, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LazyImage from '../components/ui/LazyImage';

const ProductDetail = () => {
  const { id } = useParams();
  const { dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      // Don't fetch if Supabase is not configured
      if (import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center"><div className="w-8 h-8 border border-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-light text-charcoal/40">Essence not found.</div>;

  return (
    <main className="bg-[#FAF9F6] min-h-screen pt-32 pb-24 font-light">
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
            <div className="aspect-[4/5] bg-white shadow-2xl shadow-charcoal/10 ring-1 ring-charcoal/15 rounded-3xl overflow-hidden">
              <LazyImage 
                src={product.images?.[0]} 
                alt={product.name} 
                containerClassName="w-full h-full"
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Elegant Floating Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -top-4 -right-4 bg-gold text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            >
              <div className="text-center">
                <span className="text-[8px] uppercase tracking-tighter block leading-none font-bold">Original</span>
                <span className="text-[10px] font-serif italic block font-bold">Scent</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block font-black">{product.category}</span>
              <h1 className="text-4xl md:text-5xl font-light text-charcoal mb-4 tracking-tight uppercase leading-tight font-serif italic">{product.name}</h1>
              <p className="text-xl text-charcoal/80 mb-8 font-sans font-bold">Rs. {product.price}</p>
              
              <div className="text-sm text-charcoal/90 mb-10 leading-relaxed max-w-md font-medium">
                <p>{product.description}</p>
              </div>

              {/* Composition */}
              <div className="mb-10 space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest font-black border-b-2 border-charcoal/20 pb-2">Olfactory Pyramid</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/70 block font-bold">Top</span>
                    <p className="text-xs font-bold italic">{product.scent_notes?.top?.join(", ")}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/70 block font-bold">Heart</span>
                    <p className="text-xs font-bold italic">{product.scent_notes?.heart?.join(", ")}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/70 block font-bold">Base</span>
                    <p className="text-xs font-bold italic">{product.scent_notes?.base?.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-10">
                <button 
                  onClick={addToCart}
                  className="w-full bg-charcoal text-ivory py-4 uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-3 font-bold shadow-xl shadow-charcoal/20"
                >
                  <ShoppingBag size={14} strokeWidth={2} /> Add to Collection
                </button>
              </div>

              {/* Performance & Shipping */}
              <div className="grid grid-cols-2 gap-8 pt-10 border-t-2 border-charcoal/10">
                <div>
                  <h4 className="text-[9px] uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                    <Clock size={12} className="text-gold stroke-[3]" /> Performance
                  </h4>
                  <p className="text-[10px] text-charcoal/80 leading-relaxed font-bold">
                    Longevity: {product.performance?.longevity}<br />
                    Sillage: {product.performance?.sillage}
                  </p>
                </div>
                <div>
                  <h4 className="text-[9px] uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                    <Truck size={12} className="text-gold stroke-[3]" /> Delivery
                  </h4>
                  <p className="text-[10px] text-charcoal/80 leading-relaxed font-bold">
                    {product.shipping}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-2 text-[9px] text-charcoal/60 tracking-widest uppercase font-black">
                <Phone size={10} strokeWidth={3} /> Concierge: 0314 1754782
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
