import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import SEO from '../components/ui/SEO';

const About = () => {
  return (
    <main className="min-h-screen bg-[#FAF9F6] font-light">
      <SEO 
        title="Our Story | The House of Kashume" 
        description="Learn about the heritage and craftsmanship behind Kashume. We bridge the gap between luxury and accessibility in the world of artisanal perfumery."
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
              House of Kashume
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-charcoal tracking-tight">
              About Us
            </h1>
          </motion.div>

          <div className="space-y-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="prose prose-lg mx-auto"
            >
              <p className="text-xl md:text-2xl text-charcoal/80 font-serif italic leading-relaxed text-center">
                At Kashume, we believe luxury fragrance should accessible to each and every one. we created premium impression perfumes designed for people who want to smell confident, elegant, and unforgettable — every single day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="w-full h-[1px] bg-charcoal/10"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="max-w-2xl mx-auto text-center"
            >
              <p className="text-charcoal/60 leading-relaxed mb-8">
                Born with a vision to make luxury fragrances accessible in Pakistan, Kashume combines modern branding, long lasting performance, and carefully crafted scent profiles into every bottle. From fresh everyday signatures to bold statement fragrances, every creation is designed to leave an impression.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Decorative section */}
      <section className="bg-charcoal text-ivory py-24 mt-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif italic mb-8">
            Crafting Unforgettable Impressions.
          </h2>
          <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />
          <p className="text-ivory/60 max-w-lg mx-auto text-sm uppercase tracking-[0.2em] font-light">
            Every bottle is a dialogue between nature and the artisan.
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;
