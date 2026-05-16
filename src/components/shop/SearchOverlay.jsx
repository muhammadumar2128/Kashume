import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import LazyImage from '../ui/LazyImage';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) inputRef.current.focus();
      fetchTrending();
    }
  }, [isOpen]);

  const fetchTrending = async () => {
    try {
      const { data } = await supabase.from('products').select('name').limit(4);
      if (data) setTrending(data.map(p => p.name));
    } catch (err) {
      console.error('Error fetching trending:', err);
    }
  };

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      console.log(`Search: Querying database for "${query}"...`);
      try {
        // Search by Name or Description (Case Insensitive)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(6);

        if (error) throw error;
        
        console.log(`Search: Found ${data?.length || 0} results for "${query}"`);
        setResults(data || []);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchProducts, 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#F5F2ED] flex flex-col"
        >
          {/* Header */}
          <div className="container mx-auto px-6 py-8 md:py-12 flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">The Archives</span>
            <button 
              onClick={onClose}
              className="p-2 hover:rotate-90 transition-transform duration-500 text-charcoal"
            >
              <X size={24} strokeWidth={1} />
            </button>
          </div>

          {/* Search Input Area */}
          <div className="container mx-auto px-6 flex-grow flex flex-col max-w-4xl pt-12 md:pt-24">
            <div className="relative group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gold" size={32} strokeWidth={1} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for an essence..."
                className="w-full bg-transparent border-b-2 border-charcoal/10 py-6 pl-12 text-2xl md:text-5xl font-serif italic text-charcoal outline-none focus:border-gold transition-all duration-700 placeholder:text-charcoal/10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-gold" size={24} />
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="mt-12 md:mt-20 overflow-y-auto custom-scrollbar pb-24">
              <AnimatePresence mode="wait">
                {results.length > 0 ? (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
                  >
                    {results.map((product) => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="group flex gap-6 items-center border-b border-charcoal/5 pb-8"
                      >
                        <div className="w-20 h-28 bg-white overflow-hidden rounded-xl ring-1 ring-charcoal/10 group-hover:shadow-2xl transition-all duration-700">
                          <LazyImage 
                            src={product.images?.[0] || product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                          />
                        </div>
                        <div className="flex-grow space-y-1">
                          <span className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold">{product.gender}</span>
                          <h3 className="text-xl font-serif italic text-charcoal group-hover:text-gold transition-colors">{product.name}</h3>
                          <p className="text-xs text-charcoal/40 font-bold tracking-widest">Rs. {product.price}</p>
                        </div>
                        <ArrowRight size={18} className="text-charcoal/20 group-hover:text-gold group-hover:translate-x-2 transition-all" />
                      </Link>
                    ))}
                  </motion.div>
                ) : query.trim().length >= 2 && !loading ? (
                  <motion.div 
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24"
                  >
                    <p className="text-sm text-charcoal/40 uppercase tracking-[0.3em]">No essences match your query.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                  >
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Recommended</h4>
                      <div className="space-y-3 flex flex-col items-start">
                        {(trending.length > 0 ? trending : ['Intero HIM', 'Intero HER']).map(term => (
                          <button 
                            key={term}
                            onClick={() => setQuery(term)}
                            className="text-xs uppercase tracking-widest text-charcoal/60 hover:text-gold transition-colors font-bold text-left border-b border-transparent hover:border-gold"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
