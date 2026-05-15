import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import SEO from '../components/ui/SEO';

const ShippingPolicy = () => {
  return (
    <main className="min-h-screen bg-[#FAF9F6] font-light">
      <SEO 
        title="Shipping Protocol | Kashume" 
        description="Review Kashume's shipping policies for deliveries within Pakistan. Learn about processing times, delivery windows, and our trusted courier partners."
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
              Protocol
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-charcoal tracking-tight">
              Shipping Policy
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="prose prose-lg mx-auto bg-white p-8 md:p-16 shadow-2xl shadow-charcoal/5 ring-1 ring-charcoal/5 rounded-3xl"
          >
            <div className="space-y-8 text-charcoal/80 leading-relaxed font-light italic text-center md:text-left">
              <p className="text-xl md:text-2xl font-serif">
                At Kashume, we want to ensure that our customers receive their fragrance purchases in a timely and efficient manner. 
              </p>
              
              <div className="w-12 h-[1px] bg-gold/40 mx-auto md:mx-0" />
              
              <p>
                We offer shipping to all locations within Pakistan, and our products are shipped via trusted courier services.
              </p>

              <p>
                Orders are usually processed and shipped within <span className="text-charcoal font-bold">1-2 business days</span> of being placed. Shipping times may vary depending on your location, with deliveries typically taking between <span className="text-charcoal font-bold">2-5 business days</span> for most locations within Pakistan.
              </p>

              <div className="p-6 bg-[#F5F2ED]/50 border-l-2 border-gold italic text-sm">
                Please note that we cannot be held responsible for any delays caused by the courier service.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="bg-charcoal text-ivory py-24 mt-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif italic mb-8">
            Ensuring Botanical Integrity.
          </h2>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />
          <p className="text-ivory/60 max-w-lg mx-auto text-sm uppercase tracking-[0.2em] font-light">
            Every bottle is protected in our signature archives for a safe journey.
          </p>
        </div>
      </section>
    </main>
  );
};

export default ShippingPolicy;
