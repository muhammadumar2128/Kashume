import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import ProductCard from '../components/shop/ProductCard';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      // Don't fetch if Supabase is not configured
      if (import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_bundle', false)
          .order('created_at', { ascending: false });

        if (error || !data) {
          setProducts([]);
        } else {
          setProducts(data);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="relative bg-[#FAF9F6] min-h-screen pt-40 pb-24">
      <Navbar />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] text-gold mb-6 block">The Library</span>
          <h1 className="text-5xl md:text-6xl font-light text-charcoal mb-8 tracking-tighter">Essences</h1>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-6 h-6 border-[1px] border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
            {products.map((product, idx) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={idx} 
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;
