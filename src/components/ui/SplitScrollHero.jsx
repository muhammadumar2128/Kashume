import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SplitScrollHero = () => {
  const containerRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    "/images/DATA 1.O/hero section 1.webp",
    "/images/DATA 1.O/hero home 2.png",
    "/images/DATA 1.O/hero home 1.png"
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Preload hero images on mount
  useEffect(() => {
    heroImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-2%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} style={{ position: 'relative' }} className="relative h-[110vh] bg-[#FAF9F6] overflow-hidden">
      <div className="sticky top-0 h-screen flex flex-col md:flex-row">
        
        {/* Editorial Content - Top on Mobile, Left on Desktop */}
        <div className="w-full h-[45%] md:h-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 z-20 bg-[#FAF9F6] order-2 md:order-1">
          <motion.div style={{ y: textY, opacity }}>
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-[9px] md:text-[10px] uppercase text-gold mb-4 md:mb-8 block font-medium"
            >
              Artisanal Distillation
            </motion.span>
            
            <h1 className="text-4xl md:text-8xl font-serif leading-[0.9] text-charcoal mb-6 md:mb-10 tracking-tighter">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="block"
              >
                Liquid
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="block italic font-light ml-4 md:ml-16 mt-1 md:mt-2"
              >
                Memories.
              </motion.span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="max-w-[240px] md:max-w-xs text-charcoal/60 text-[11px] md:text-sm font-light leading-relaxed mb-8 md:mb-12 border-l border-gold/30 pl-4 md:pl-6"
            >
              Every bottle of Kashume is a chapter of a story yet to be told. Explore our signature essences.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1 }}
            >
              <Link 
                to="/shop"
                className="inline-block bg-charcoal text-ivory px-8 md:px-12 py-3 md:py-5 text-[9px] md:text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-all duration-500 shadow-xl shadow-charcoal/10"
              >
                View Collection
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated Image Gallery - Bottom on Mobile, Right on Desktop */}
        <div className="w-full h-[55%] md:h-full md:w-1/2 relative overflow-hidden bg-[#F5F2ED] order-1 md:order-2">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ y: imageY }}
              className="w-full h-full absolute top-0 left-0"
            >
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 6, ease: "linear" }}
                src={heroImages[currentImageIndex]} 
                alt="Kashume Hero" 
                fetchpriority={currentImageIndex === 0 ? "high" : "auto"}
                className="w-full h-full object-cover object-[center_30%]"
              />
              <div className="absolute inset-0 bg-charcoal/[0.02]" />
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-transparent to-transparent md:bg-gradient-to-r md:from-[#FAF9F6] md:via-transparent md:to-transparent z-10" />
          
          <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-30 flex md:flex-col gap-2 md:gap-4">
            {heroImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-6 h-[1px] md:w-[1px] md:h-8 transition-all duration-1000 ${idx === currentImageIndex ? 'bg-gold w-10 md:h-12' : 'bg-charcoal/10'}`} 
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SplitScrollHero;
