import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import ProductCard from '../components/shop/ProductCard';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      // Don't fetch if Supabase is not configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_new_arrival', true)
          .eq('is_bundle', false)
          .limit(3);

        if (error || !data) {
          setProducts([]);
        } else {
          // Map database structure to component structure if needed
          setProducts(data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category || "Artisanal",
            price: p.price,
            image: p.images?.[0] || "/images/placeholder.png",
            notes: p.scent_notes?.top || []
          })));
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <main className="relative bg-[#FAF9F6] min-h-screen pt-32 pb-24">
      <Navbar />

      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-gold mb-4 block">Discover</span>
          <h1 className="text-4xl md:text-5xl font-light text-charcoal mb-6">New Arrivals</h1>
          <p className="text-charcoal/60 max-w-lg mx-auto text-sm font-light leading-relaxed">
            Explore our latest olfactory creations, distilled for the modern connoisseur.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
            {products.map((product, idx) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={idx}
                isNew={true}
              />
            ))}
          </div>
        )}
        
        <div className="mt-20 text-center">
          <Link to="/shop" className="inline-block text-[10px] uppercase tracking-widest border border-charcoal/20 px-10 py-4 hover:bg-charcoal hover:text-ivory transition-all">
            View All Essences
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NewArrivals;
