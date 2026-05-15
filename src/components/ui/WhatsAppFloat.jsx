import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
  const phoneNumber = "923141754782";
  const message = encodeURIComponent("Hello Kashume! I'm interested in your essences and would like to know more.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center group"
      title="Chat with Kashume"
    >
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-charcoal text-ivory text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
        Chat with us
      </span>

      {/* Pulse Effect */}
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-[#25D366] rounded-full -z-10 opacity-50"
      />
      
      <MessageCircle size={28} fill="currentColor" className="text-white" />
    </motion.a>
  );
};

export default WhatsAppFloat;
