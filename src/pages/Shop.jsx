import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import ProductCard from '../components/shop/ProductCard';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import SEO from '../components/ui/SEO';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGender, setActiveGender] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      // Safely check if Supabase is configured
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (!url || url.includes('placeholder')) {
        console.warn('Shop: Supabase URL is missing or placeholder.');
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_bundle', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Shop fetch error:', error);
          setProducts([]);
          setFilteredProducts([]);
        } else if (!data) {
          console.warn('Shop: No data returned from Supabase.');
          setProducts([]);
          setFilteredProducts([]);
        } else {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err) {
        console.error('Shop unexpected error:', err);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeGender === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.gender === activeGender));
    }
  }, [activeGender, products]);

  return (
    <main className="relative bg-[#FAF9F6] min-h-screen pt-40 pb-24">
      <SEO 
        title="Botanical Library | All Products" 
        description="Explore the full collection of Kashume's artisanal perfumes. From fresh summer scents to deep oriental blends, find your signature essence."
      />
      <Navbar />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] text-gold mb-6 block">The Library</span>
          <h1 className="text-5xl md:text-6xl font-light text-charcoal mb-8 tracking-tighter uppercase">All Products</h1>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-12" />
          
          {/* Gender Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-12">
            {['All', 'Men', 'Women', 'Unisex'].map((gender) => (
              <button
                key={gender}
                onClick={() => setActiveGender(gender)}
                className={`text-[10px] md:text-xs uppercase tracking-[0.3em] pb-2 border-b-2 transition-all duration-500 font-bold ${
                  activeGender === gender ? 'border-gold text-charcoal' : 'border-transparent text-charcoal/40 hover:text-charcoal/60'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-6 h-6 border-[1px] border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-12 md:gap-y-24">
            {filteredProducts.map((product, idx) => (
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
