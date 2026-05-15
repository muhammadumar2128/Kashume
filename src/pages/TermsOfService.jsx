import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import SEO from '../components/ui/SEO';

const TermsOfService = () => {
  return (
    <main className="min-h-screen bg-[#FAF9F6] font-light">
      <SEO 
        title="Sanctum Protocol | Terms of Service" 
        description="Review the terms and conditions for using Kashume's website and purchasing our artisanal perfumes."
      />
      <Navbar variant="dark" />
      
      <section className="pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center mb-20"
          >
            <span className="text-[10px] uppercase tracking-[0.6em] text-gold mb-4 block font-bold">
              Legal
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-charcoal tracking-tight">
              Terms of Service
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="prose prose-lg mx-auto bg-white p-8 md:p-16 shadow-2xl shadow-charcoal/5 ring-1 ring-charcoal/5 rounded-3xl"
          >
            <div className="space-y-12 text-charcoal/80 leading-relaxed font-light italic">
              <p className="text-lg font-serif text-center">
                Welcome to Kashume. By using our website and purchasing our products, you agree to the following terms:
              </p>
              
              <div className="space-y-6">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b border-gold/20 pb-2">General</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>All orders are subject to availability and confirmation.</li>
                  <li>We reserve the right to cancel any order at our discretion.</li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b border-gold/20 pb-2">Product Information</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>We aim to display accurate product details, but slight variations may occur.</li>
                  <li>Fragrance perception may vary from person to person.</li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b border-gold/20 pb-2">Pricing & Payments</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>All prices are listed in PKR.</li>
                  <li>We reserve the right to update prices anytime without prior notice.</li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black text-gold border-b border-gold/20 pb-2">Liability</h2>
                <p>Kashume is not responsible for:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Delays caused by courier services</li>
                  <li>Misuse of products</li>
                  <li>Allergic reactions (please test before full use)</li>
                </ul>
              </div>

              <div className="pt-8 border-t border-charcoal/5 text-center">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black text-gold mb-4">Contact</h2>
                <p className="text-sm">
                  For any questions or support, contact us on WhatsApp:<br/>
                  <a href="https://wa.me/923141754782" className="text-charcoal font-bold hover:text-gold transition-colors">+92 314 1754782</a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default TermsOfService;
