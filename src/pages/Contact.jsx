import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import SEO from '../components/ui/SEO';

const Contact = () => {
  return (
    <main className="min-h-screen bg-[#FAF9F6] font-light pt-32 pb-24">
      <SEO 
        title="Concierge | Contact Kashume" 
        description="Connect with our olfactory concierge. Whether you have a question about an essence or need assistance with an order, we are here to help."
      />
      <Navbar variant="dark" />
      
      <section className="pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center mb-20"
          >
            <span className="text-[10px] uppercase tracking-[0.6em] text-gold mb-4 block font-bold">
              Connect With Us
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight">
              Contact Us
            </h1>
            <p className="mt-8 text-charcoal/60 max-w-xl mx-auto leading-relaxed">
              We love to hear from you! Whether you have questions, feedback or need assistance. Our team is here to help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white p-10 border border-charcoal/5 shadow-sm rounded-2xl group hover:shadow-xl transition-all duration-700">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-12 h-12 bg-[#F5F2ED] rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-charcoal transition-all duration-500">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40">Email Us</h3>
                    <p className="text-lg font-serif italic">hello@kashume.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 border border-charcoal/5 shadow-sm rounded-2xl group hover:shadow-xl transition-all duration-700">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-12 h-12 bg-[#F5F2ED] rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-charcoal transition-all duration-500">
                    <Phone size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40">Call / WhatsApp</h3>
                    <p className="text-lg font-serif italic">+92 314 1754782</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Response Time & WhatsApp Link */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-col justify-between"
            >
              <div className="bg-charcoal text-ivory p-10 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <Clock size={20} className="text-gold" />
                    <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Protocol</h3>
                  </div>
                  <p className="text-xl font-serif italic mb-10 leading-relaxed">
                    We typically respond within 24 hours. We appreciate your patience and understanding!
                  </p>
                  <a 
                    href="https://wa.me/message/ZXZ3RMSGOHPOH1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gold text-charcoal px-8 py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-ivory transition-all duration-500 rounded-sm"
                  >
                    <MessageCircle size={16} /> WhatsApp Chat
                  </a>
                </div>
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
