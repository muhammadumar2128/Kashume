import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
  const brand = "KASHUME";
  const [startPanels, setStartPanels] = useState(false);

  const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartPanels(true);
    }, 1200); // Reduced from 2200 for a snappier entrance
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const panelVariants = {
    initial: { y: 0 },
    exit: (i) => ({
      y: i % 2 === 0 ? "-100%" : "100%",
      transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1], delay: 0.1 } // Faster duration
    })
  };

  const letterVariants = {
    initial: { y: 100, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 } // Faster duration/delay
    }),
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.4, ease: "easeIn" }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden pointer-events-none">
      {/* 4 Vertical Panels */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={panelVariants}
          initial="initial"
          animate={startPanels ? "exit" : "initial"}
          exit="exit"
          className="relative h-full w-1/4 bg-charcoal border-r border-white/5 last:border-r-0"
        />
      ))}

      {/* Center Branding */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
        <div className="flex overflow-hidden pb-2">
          {brand.split("").map((letter, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-ivory font-serif italic text-5xl md:text-8xl tracking-[0.1em] inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100px" }}
          transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
          className="h-[1px] bg-gold/50 my-8"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-[10px] uppercase text-gold/60 font-bold tracking-[0.6em] ml-[0.6em]"
        >
          Established 2024
        </motion.p>
      </div>

      {/* Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("${noiseSvg}")` }}
      />
    </div>
  );
};

export default Preloader;
