import Navbar from '../components/layout/Navbar';
import SplitScrollHero from '../components/ui/SplitScrollHero';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Check, Award, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import SEO from '../components/ui/SEO';

const Home = () => {
  const [signatureProducts, setSignatureProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useCart();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch Signature Products
        const { data: signatureData } = await supabase
          .from('products')
          .select('*')
          .eq('is_signature', true)
          .eq('status', 'published')
          .limit(3);
        
        setSignatureProducts(signatureData || []);

        // Fetch Bundles
        const { data: bundlesData } = await supabase
          .from('products')
          .select('*')
          .eq('is_bundle', true)
          .eq('status', 'published')
          .limit(2);

        if (bundlesData) {
          const dynamicBundles = bundlesData.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price || p.price + 500,
            description: p.description,
            image: p.images?.[0] || "/images/DATA 1.O/Bundles/1.png",
            items: p.scent_notes?.top || ["Limited Edition Ensemble"],
            benefit: p.shipping || "Complimentary Shipping"
          }));
          setBundles(dynamicBundles);
        }
      } catch (err) {
        console.error('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const addToCart = (bundle) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...bundle, price: bundle.price } });
  };

  return (
    <main className="relative bg-[#FAF9F6]">
      <Navbar />
      <SplitScrollHero />

      {/* Signature Showcase - Editorial Layout */}
      {signatureProducts.length > 0 && (
        <section className="py-32 md:py-56 bg-white relative overflow-hidden">
          {/* Ambient Background Element */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[#F5F2ED]/50 -z-10 translate-x-1/4" />
          
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start justify-between mb-24 md:mb-32 gap-12">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                >
                  <span className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-gold font-black mb-8 block">
                    The Masterpiece Series
                  </span>
                  <h2 className="text-5xl md:text-8xl font-serif italic text-charcoal leading-[0.9] tracking-tighter uppercase">
                    Signature <br />
                    <span className="md:ml-24 text-gold/80">Essences</span>
                  </h2>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.5 }}
                className="md:pt-12"
              >
                <p className="text-xs md:text-sm text-charcoal/50 max-w-[280px] leading-relaxed uppercase tracking-[0.2em] font-bold italic border-l border-gold/30 pl-8">
                  "Each bottle is a singular narrative, distilled from the rarest botanical extracts in our archives."
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 md:gap-y-32">
              {signatureProducts.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: idx * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative ${idx === 1 ? 'md:mt-24' : idx === 2 ? 'lg:mt-12' : ''}`}
                >
                  <div className="relative group">
                    <ProductCard product={product} index={idx} />
                    
                    {/* Floating Motif */}
                    <div className="absolute -top-6 -left-6 w-12 h-12 border border-gold/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                       <Award className="text-gold/20" size={20} strokeWidth={1} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Bundles Section - Home Page Exclusive */}
      <section className="py-24 bg-[#F5F2ED]/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-24">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] uppercase tracking-[0.6em] text-gold mb-6 block"
            >
              Curated Collections
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-light mb-8 tracking-tighter"
            >
              Bundle Options
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1 }}
              className="h-[1px] bg-gold/40 mx-auto" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {bundles.map((bundle, idx) => (
              <motion.div 
                key={bundle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className="group relative flex flex-col md:flex-row gap-10 items-start"
              >
                {/* Image Side - Compact & Framed */}
                <Link to={`/bundle/${bundle.id}`} className="w-[85%] mx-auto md:mx-0 md:w-[45%] block group/img">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-sm ring-1 ring-charcoal/20 relative flex items-center justify-center [transform:translateZ(0)]">
                    <motion.img 
                      initial={{ opacity: 0, scale: 1.15, filter: "blur(10px)" }}
                      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ 
                        duration: 3, 
                        ease: [0.22, 1, 0.36, 1],
                        delay: idx * 0.4 
                      }}
                      src={bundle.image} 
                      alt={bundle.name} 
                      className="w-full h-full object-cover rounded-xl md:rounded-2xl grayscale-[10%] group-hover/img:grayscale-0 group-hover/img:scale-105 transition-all duration-[3s] ease-out"
                    />
                    
                    {/* Soft Ambient Shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-4 left-4 bg-charcoal text-[8px] text-white px-2 py-1 uppercase tracking-widest z-20 font-bold">
                      Best Value
                    </div>
                  </div>
                </Link>
                
                {/* Content Side - Refined Typography */}
                <div className="w-full md:w-[55%] flex flex-col pt-2">
                  <div className="flex items-center gap-2 mb-4 text-gold">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Limited Set</span>
                  </div>
                  
                  <Link to={`/bundle/${bundle.id}`}>
                    <h3 className="text-3xl font-serif italic mb-4 text-charcoal tracking-tight font-bold hover:text-gold transition-colors">
                      {bundle.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-xl font-sans text-charcoal font-bold">Rs. {bundle.price}</span>
                    <span className="text-xs font-sans text-charcoal/60 line-through font-bold">Rs. {bundle.originalPrice}</span>
                  </div>
                  
                  <p className="text-[12px] text-charcoal/80 leading-relaxed mb-8 font-medium italic">
                    {bundle.description}
                  </p>

                  <ul className="mb-10 space-y-3">
                    {bundle.items.map(item => (
                      <li key={item} className="text-[10px] uppercase tracking-[0.15em] text-charcoal font-bold flex items-center gap-3">
                        <Check size={10} className="text-gold stroke-[3]" /> {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-8 p-3 border-l-2 border-gold bg-gold/10">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-black block">
                      {bundle.benefit}
                    </span>
                  </div>

                  <button 
                    onClick={() => addToCart(bundle)}
                    className="w-full bg-charcoal text-ivory py-4 uppercase tracking-[0.4em] text-[10px] hover:bg-gold hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 shadow-lg shadow-charcoal/20 font-bold"
                  >
                    <ShoppingBag size={14} strokeWidth={2} /> Add to Collection
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="bg-charcoal text-ivory py-32 px-6 md:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="font-serif italic text-2xl md:text-5xl font-light leading-relaxed mb-16"
          >
            {`"We don't just create scents; we preserve memories in liquid form. Every bottle of Kashume is a chapter of a story yet to be told."`.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <a href="/vision" className="text-[10px] uppercase tracking-[0.5em] text-gold/60 hover:text-gold transition-all duration-500 border-b border-gold/20 pb-2 hover:border-gold">
              Our Vision
            </a>
          </motion.div>
        </div>
      </section>    </main>
  );
};

export default Home;
