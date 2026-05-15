import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { supabase } from '../lib/supabaseClient';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SEO from '../components/ui/SEO';

const FAQItem = ({ faq, isOpen, toggle }) => {
  return (
    <div className="border-b border-charcoal/5 last:border-0 overflow-hidden">
      <button 
        onClick={toggle}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span className="text-lg md:text-xl font-serif italic text-charcoal group-hover:text-gold transition-colors duration-500">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-gold/40"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pb-8 pr-12 text-sm md:text-base text-charcoal/60 font-light leading-relaxed italic">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (!error) setFaqs(data || []);
      setLoading(false);
    };

    fetchFaqs();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F6] font-light">
      <SEO 
        title="Archives | FAQ" 
        description="Frequently asked questions about Kashume's essences, shipping protocols, and artisanal distillation process."
      />
      <Navbar />
      
      {/* Header */}
      <section className="pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.8em] text-gold mb-6 block"
          >
            Assistance
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif italic tracking-tighter text-charcoal mb-12"
          >
            Archives of Inquiry
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "80px" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-[1px] bg-gold/40 mx-auto"
          />
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-32 px-6">
        <div className="container mx-auto max-w-3xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-charcoal/10">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <HelpCircle size={40} />
              </motion.div>
            </div>
          ) : faqs.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 md:p-12 shadow-2xl shadow-charcoal/5 ring-1 ring-charcoal/5"
            >
              {faqs.map((faq) => (
                <FAQItem 
                  key={faq.id} 
                  faq={faq} 
                  isOpen={openId === faq.id}
                  toggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-charcoal/30 italic">
              The archives are currently silent. Please contact concierge for direct assistance.
            </div>
          )}
        </div>
      </section>
      
      {/* Concierge Teaser */}
      <section className="bg-charcoal py-24 px-6 text-center">
        <h3 className="text-ivory font-serif italic text-3xl mb-8">Still seeking answers?</h3>
        <p className="text-ivory/60 text-sm tracking-widest uppercase mb-12">Our concierge is available for personal guidance.</p>
        <a 
          href="mailto:concierge@kashume.com" 
          className="inline-block border border-gold/30 px-12 py-5 text-[10px] uppercase tracking-[0.4em] text-gold hover:bg-gold hover:text-charcoal transition-all duration-700"
        >
          Contact Concierge
        </a>
      </section>
    </main>
  );
};

export default FAQ;
