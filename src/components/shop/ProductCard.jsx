import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from '../ui/LazyImage';
import { useState, useEffect } from 'react';

const ProductCard = ({ product, index, isNew = false }) => {
  const { dispatch } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000); // Change image every 5 seconds (slower)
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      ...product,
      image: images[0]
    };
    
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] w-full max-w-[280px] mx-auto rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-8 bg-white transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-charcoal/10 ring-1 ring-charcoal/15">
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
                src={images[currentImageIndex]} 
                alt={`${product.name} - View ${currentImageIndex + 1}`}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
            </motion.div>
          </AnimatePresence>

          {/* Manual Navigation Arrows */}
          {images.length > 1 && (
            <div className="absolute inset-0 z-20 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <button 
                onClick={handlePrevImage}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-charcoal transition-all duration-300 active:scale-90 pointer-events-auto shadow-lg"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button 
                onClick={handleNextImage}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-charcoal transition-all duration-300 active:scale-90 pointer-events-auto shadow-lg"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
          
          {/* Add to Cart Overlay - Desktop & Tablet */}
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-700 flex items-end justify-center pb-6 z-10">
            <button 
              onClick={handleAddToCart}
              className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-white text-charcoal px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white shadow-xl transform active:scale-95 hidden md:flex"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
            
            {/* Mobile Quick Add - Constant Visibility or on Tap */}
            <button 
              onClick={handleAddToCart}
              className="md:hidden absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-charcoal shadow-lg active:scale-90 transition-transform z-20"
            >
              <ShoppingBag size={16} />
            </button>
          </div>

          {isNew && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
              <span className="text-[6px] md:text-[8px] bg-charcoal text-ivory px-1.5 md:px-2 py-0.5 md:py-1 uppercase tracking-widest font-bold rounded-sm shadow-sm">
                New
              </span>
            </div>
          )}

          {product.gender && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
              <span className="text-[6px] md:text-[8px] bg-gold/90 text-charcoal px-1.5 md:px-2 py-0.5 md:py-1 uppercase tracking-widest font-black rounded-sm shadow-sm backdrop-blur-sm">
                {product.gender}
              </span>
            </div>
          )}
        </div>
        
        <div className="text-center space-y-1 md:space-y-2">
          <span className="text-[7px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-gold font-bold block">
            {product.category}
          </span>
          <h3 className="text-sm md:text-xl font-serif italic text-charcoal tracking-tight group-hover:text-gold transition-colors duration-500 font-bold">
            {product.name}
          </h3>
          <p className="font-sans text-[10px] md:text-[12px] font-bold text-charcoal/70 tracking-[0.1em]">
            Rs. {product.price}
          </p>
        </div>
      </Link>
      
      {product.notes && (
        <div className="hidden md:flex gap-1 justify-center mt-3">
          {product.notes.slice(0, 3).map(note => (
            <span key={note} className="text-[8px] border border-charcoal/10 px-1.5 py-0.5 text-charcoal/40 uppercase tracking-tighter">
              {note}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard;
