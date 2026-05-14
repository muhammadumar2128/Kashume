import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import LazyImage from '../components/ui/LazyImage';

const ChapterSection = ({ title, subtitle, description, image, index, isReversed }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <section ref={ref} className={`relative py-16 md:py-24 px-6 md:px-24 flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}>
      {/* Image Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: "blur(15px)" }}
        animate={isInView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full md:w-1/2 aspect-[4/5] bg-white shadow-2xl shadow-charcoal/5 ring-1 ring-charcoal/5 overflow-hidden relative rounded-2xl"
      >
        <LazyImage 
          src={image} 
          alt={title} 
          containerClassName="w-full h-full"
          className="w-full h-full object-cover grayscale-[20%]"
        />
      </motion.div>

      {/* Content */}
      <div className="w-full md:w-1/2 space-y-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
        >
          <span className="text-[10px] uppercase tracking-[0.6em] text-gold mb-4 block font-bold">
            Chapter 0{index + 1}
          </span>
          <h2 className="text-5xl md:text-7xl font-serif italic text-charcoal tracking-tighter leading-tight mb-8">
            {title}
          </h2>
          <div className="w-12 h-[1px] bg-gold/40 mb-10" />
          <p className="text-sm md:text-base text-charcoal/60 leading-relaxed font-light max-w-md italic">
            "{description}"
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const Vision = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const sections = [
    {
      title: "The Botanical Source",
      description: "Our journey begins in the untamed gardens, where the earth breathes life into the most delicate flora. We don't just pick flowers; we listen to the soil.",
      image: "/images/DATA 1.O/hero home 2.png"
    },
    {
      title: "Artisanal Distillation",
      description: "Every essence is a dialogue between nature and the artisan. We distill time, patience, and absolute precision to capture the soul of the plant.",
      image: "/images/DATA 1.O/hero home 3.png"
    },
    {
      title: "Liquid Memories",
      description: "A Kashume bottle is a cathedral of glass, designed to protect the fragile soul of the scent within. We sell the moment before a first kiss.",
      image: "/images/DATA 1.O/hero home 1.png"
    }
  ];

  return (
    <main ref={containerRef} className="relative bg-[#FAF9F6] overflow-x-hidden font-light">
      <Navbar variant="light" />
      
      {/* Cinematic Hero Section */}
      <section ref={heroRef} style={{ position: 'relative' }} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer with Parallax */}
        <motion.div 
          style={{ y: heroY }}
          className="absolute inset-0 z-0"
        >
          {/* Multi-layered Blending Overlay */}
          <div className="absolute inset-0 z-10">
            {/* Overall cinematic tint - Darkened for better text contrast */}
            <div className="absolute inset-0 bg-charcoal/60" />
            
            {/* Top Shadow - Essential for Ivory Text Visibility */}
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-charcoal/90 via-charcoal/60 to-transparent" />
            
            {/* Bottom Blend - Mixes with the Ivory Site Background */}
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#FAF9F6] to-transparent z-10" />
            
            {/* Bottom Atmospheric Blur */}
            <div className="absolute bottom-0 w-full h-24 backdrop-blur-[2px] z-0" />
          </div>

          <motion.img 
            initial={{ scale: 1.2, filter: "blur(40px)", opacity: 0 }}
            animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
            src="/images/DATA 1.O/our vision hero section.png" 
            className="w-full h-full object-cover grayscale"
            alt="Vision Background"
          />
        </motion.div>

        <motion.div 
          style={{ opacity: heroOpacity }}
          className="text-center z-20 px-6 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, delay: 1, ease: "easeOut" }}
          >
            <span className="text-[10px] md:text-[12px] uppercase tracking-[0.8em] text-gold mb-6 block font-medium">
              The House of Kashume
            </span>
            
            <h1 className="text-7xl md:text-[140px] font-serif leading-none text-ivory mb-8 relative">
              <span className="block italic font-light opacity-90">Defining</span>
              <span className="block tracking-tighter -mt-4 md:-mt-8">Our Vision.</span>
              
              {/* Decorative Accent */}
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 2, delay: 1, ease: "circOut" }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-[1px] bg-gold/50 hidden md:block"
              />
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1.2 }}
            className="text-gold text-[10px] uppercase tracking-[0.4em] mt-12 max-w-xs mx-auto leading-relaxed border-l border-r border-gold/30 px-4"
          >
            A manifesto of scent, soul, and absolute botanical integrity.
          </motion.p>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] uppercase tracking-[0.3em] text-ivory/40">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold/40 to-transparent" />
        </motion.div>
      </section>

      {/* Narrative Chapters */}
      <div className="relative">
        {sections.map((section, idx) => (
          <ChapterSection 
            key={idx} 
            {...section} 
            index={idx} 
            isReversed={idx % 2 !== 0} 
          />
        ))}
      </div>

      {/* Manifest Section */}
      <section className="bg-charcoal text-ivory py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-serif italic mb-12 tracking-tight">
              A return to the botanical.
            </h2>
            <div className="w-16 h-[1px] bg-gold mx-auto mb-12" />
            <p className="text-lg md:text-xl font-light text-ivory/60 leading-relaxed mb-16">
              Kashume was founded with a singular purpose: to outclass the synthetic and honor the earth. We are a house of distillation, a sanctuary for the senses, and a tribute to the memory of nature.
            </p>
            <Link 
              to="/shop"
              className="inline-block border border-gold/30 px-12 py-5 text-[10px] uppercase tracking-[0.4em] text-gold hover:bg-gold hover:text-charcoal transition-all duration-700"
            >
              Explore the Essences
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer Space Fix */}
      <div className="h-20 bg-charcoal" />
    </main>
  );
};

export default Vision;
