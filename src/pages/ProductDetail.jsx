import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { supabase } from '../lib/supabaseClient';
import { ShoppingBag, Truck, ShieldCheck, Clock, Phone, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDiscounts } from '../context/DiscountContext';
import { getEffectiveProductPrice } from '../lib/discountUtils';
import LazyImage from '../components/ui/LazyImage';
import SEO from '../components/ui/SEO';
import RichText from '../components/ui/RichText';
import ReviewSection from '../components/shop/ReviewSection';

const ProductDetail = () => {
  const { id } = useParams();
  const { dispatch } = useCart();
  const { user, profile } = useAuth();
  const { discounts } = useDiscounts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  const discountInfo = getEffectiveProductPrice(product, discounts);

  useEffect(() => {
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      // Safely check if Supabase is configured
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (!url || url.includes('placeholder')) {
        console.warn('ProductDetail: Supabase URL is missing or placeholder.');
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .eq('id', id)
          .single();

        if (error) {
          console.error('ProductDetail fetch error:', error);
          setProduct(null);
        } else if (!data) {
          console.warn('ProductDetail: No data returned from Supabase.');
          setProduct(null);
        } else {
          setProduct(data);
          // Track ViewContent Pixel Event
          if (window.fbq) {
            window.fbq('track', 'ViewContent', {
              content_name: data.name,
              content_ids: [data.id],
              content_type: 'product',
              value: data.price,
              currency: 'PKR'
            });
          }
        }
      } catch (err) {
        console.error('ProductDetail unexpected error:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
      }, 5000); // Slower interval
      return () => clearInterval(interval);
    }
  }, [product?.images]);

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const addToCart = () => {
    let basePriceToUse = selectedSize ? selectedSize.price : product.price;
    let finalPriceToUse = basePriceToUse;

    if (discountInfo.hasDiscount) {
      if (selectedSize) {
        finalPriceToUse = Math.max(0, Math.round(selectedSize.price * (discountInfo.price / (product.price || discountInfo.price || 1))));
      } else {
        finalPriceToUse = discountInfo.price;
      }
    }

    dispatch({ 
      type: 'ADD_ITEM', 
      payload: {
        ...product,
        price: finalPriceToUse,
        original_price: discountInfo.hasDiscount ? (selectedSize ? selectedSize.price : discountInfo.originalPrice) : product.original_price,
        discount_label: discountInfo.badge,
        selectedSize: selectedSize ? selectedSize.volume : null
      } 
    });

    // Track AddToCart Pixel Event
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: finalPriceToUse,
        currency: 'PKR'
      });
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center"><div className="w-8 h-8 border border-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-light text-charcoal/40">Essence not found.</div>;

  const displayImages = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  const currentDisplayPrice = discountInfo.hasDiscount 
    ? (selectedSize ? Math.max(0, Math.round(selectedSize.price * (discountInfo.price / (product.price || discountInfo.price || 1)))) : discountInfo.price)
    : (selectedSize ? selectedSize.price : product.price);

  const currentOriginalPrice = discountInfo.hasDiscount
    ? (selectedSize ? selectedSize.price : discountInfo.originalPrice)
    : (product.original_price && product.original_price > currentDisplayPrice ? product.original_price : null);

  return (
    <main className="bg-[#FAF9F6] min-h-screen pt-32 pb-24 font-light">
      <SEO 
        title={`${product.name} | ${product.category || 'Luxury Perfume'}`}
        description={product.description?.slice(0, 160)}
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
            <div className="relative aspect-[4/5] bg-white shadow-2xl shadow-charcoal/10 ring-1 ring-charcoal/15 rounded-3xl overflow-hidden group">
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
                    alt={`${product.name} - View ${currentImageIndex + 1}`} 
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover" 
                  />
                </motion.div>
              </AnimatePresence>

              {/* Manual Navigation Arrows */}
              {displayImages.length > 1 && (
                <div className="absolute inset-0 z-20 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <button 
                    onClick={prevImage}
                    className="w-12 h-12 rounded-full bg-charcoal/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-charcoal hover:bg-gold hover:text-white transition-all duration-500 active:scale-90 pointer-events-auto shadow-2xl"
                  >
                    <ChevronLeft size={24} strokeWidth={1.5} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="w-12 h-12 rounded-full bg-charcoal/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-charcoal hover:bg-gold hover:text-white transition-all duration-500 active:scale-90 pointer-events-auto shadow-2xl"
                  >
                    <ChevronRight size={24} strokeWidth={1.5} />
                  </button>
                </div>
              )}
              
              {/* Image Indicators */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                  {displayImages.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-gold w-4' : 'bg-charcoal/20 hover:bg-charcoal/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Dynamic Floating Discount Badge */}
            {discountInfo.hasDiscount ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute top-3 right-3 md:-top-4 md:-right-4 bg-red-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl z-20 flex flex-col items-center justify-center text-center ring-2 md:ring-4 ring-white"
              >
                <Tag size={16} className="mb-1" />
                <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest block leading-tight">{discountInfo.discountTitle || 'Sale'}</span>
                <span className="text-[10px] md:text-xs font-black tracking-tight">{discountInfo.percentageText}</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute top-3 right-3 md:-top-4 md:-right-4 bg-gold text-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg z-20"
              >
                <div className="text-center">
                  <span className="text-[8px] uppercase tracking-tighter block leading-none font-bold">Original</span>
                  <span className="text-[10px] font-serif italic block font-bold">Scent</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-black">{product.category}</span>
                {discountInfo.hasDiscount && (
                  <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <Tag size={10} /> {discountInfo.badge}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-charcoal mb-4 tracking-tight uppercase leading-tight font-serif italic">{product.name}</h1>
              
              <div className="flex items-baseline gap-3 md:gap-4 mb-6 flex-wrap">
                <p className="text-2xl md:text-3xl text-charcoal font-sans font-black">
                  Rs. {currentDisplayPrice}
                </p>
                {currentOriginalPrice && currentOriginalPrice > currentDisplayPrice && (
                  <p className="text-base md:text-lg text-charcoal/40 line-through font-sans font-bold">
                    Rs. {currentOriginalPrice}
                  </p>
                )}
                {discountInfo.hasDiscount && (
                  <span className="bg-red-50 text-red-600 border border-red-200 text-xs md:text-sm font-black px-2.5 py-0.5 rounded-full font-sans">
                    Save {discountInfo.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Promotional Callout Banner for Active Sale */}
              {discountInfo.hasDiscount && (
                <div className="mb-8 p-3.5 bg-gradient-to-r from-red-50 to-orange-50/50 border border-red-200/80 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Tag size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-900 uppercase tracking-wider">{discountInfo.discountTitle || 'Sale'} Active</p>
                    <p className="text-[11px] text-red-700 font-medium">{discountInfo.discountPercentage}% discount applied automatically</p>
                  </div>
                </div>
              )}
              
              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8 flex gap-3">
                  {product.sizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2 text-xs md:text-sm uppercase tracking-widest font-bold border-2 transition-all ${
                        selectedSize?.volume === size.volume 
                        ? 'border-charcoal bg-charcoal text-ivory' 
                        : 'border-charcoal/20 text-charcoal hover:border-charcoal/50'
                      }`}
                    >
                      {size.volume}
                    </button>
                  ))}
                </div>
              )}

              <RichText 
                text={product.description} 
                className="text-base md:text-lg text-charcoal/90 mb-10 leading-relaxed max-w-md font-medium" 
              />

              {/* Composition */}
              {(product.scent_notes?.top?.length > 0 || product.scent_notes?.heart?.length > 0 || product.scent_notes?.base?.length > 0) && (
                <div className="mb-10 space-y-6">
                  <h3 className="text-xs uppercase tracking-widest font-black border-b-2 border-charcoal/20 pb-2">Perfume Notes</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {product.scent_notes?.top?.length > 0 && (
                      <div>
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-charcoal/70 block font-bold">Top</span>
                        <p className="text-sm md:text-base font-bold italic">{product.scent_notes.top.join(", ")}</p>
                      </div>
                    )}
                    {product.scent_notes?.heart?.length > 0 && (
                      <div>
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-charcoal/70 block font-bold">Heart</span>
                        <p className="text-sm md:text-base font-bold italic">{product.scent_notes.heart.join(", ")}</p>
                      </div>
                    )}
                    {product.scent_notes?.base?.length > 0 && (
                      <div>
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-charcoal/70 block font-bold">Base</span>
                        <p className="text-sm md:text-base font-bold italic">{product.scent_notes.base.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 mb-10">
                <button 
                  onClick={addToCart}
                  className="w-full bg-charcoal text-ivory py-4 uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-charcoal transition-all flex items-center justify-center gap-3 font-bold shadow-xl shadow-charcoal/20"
                >
                  <ShoppingBag size={14} strokeWidth={2} /> Add to Cart
                </button>
              </div>

              {/* Performance & Shipping */}
              <div className="grid grid-cols-2 gap-8 pt-10 border-t-2 border-charcoal/10">
                <div>
                  <h4 className="text-[10px] md:text-xs uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                    <Clock size={14} className="text-gold stroke-[3]" /> Performance
                  </h4>
                  <p className="text-xs md:text-sm text-charcoal/80 leading-relaxed font-bold">
                    Longevity: {product.performance?.longevity}<br />
                    Sillage: {product.performance?.sillage}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] md:text-xs uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                    <Truck size={14} className="text-gold stroke-[3]" /> Delivery
                  </h4>
                  <p className="text-xs md:text-sm text-charcoal/80 leading-relaxed font-bold">
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

        {/* Review Section */}
        <ReviewSection 
          productId={product.id} 
          userId={user?.id} 
          userName={profile?.full_name} 
        />
      </div>
    </main>
  );
};

export default ProductDetail;
