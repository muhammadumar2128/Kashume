import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-charcoal text-ivory py-20 px-6 border-t border-earth/20">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 text-center md:text-left">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start">
          <Link to="/" className="text-4xl font-serif tracking-widest uppercase block mb-6">
            Kashume
          </Link>
          <p className="text-ivory/60 font-light max-w-sm leading-relaxed mb-8">
            A return to the botanical. We distill time, patience, and absolute precision to craft sanctuaries for the senses.
          </p>
          {/* Social Icons */}
          <div className="flex gap-6 items-center justify-center md:justify-start">
            <a href="https://www.facebook.com/kashume.pakistan" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-gold transition-colors">
              <Facebook size={20} strokeWidth={1.5} />
            </a>
            <a href="https://www.instagram.com/kashume.pakistan/" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-gold transition-colors">
              <Instagram size={20} strokeWidth={1.5} />
            </a>
            <a href="https://www.tiktok.com/@kashume.pakistan" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-gold transition-colors">
              <TikTokIcon size={20} />
            </a>
            <a href="https://wa.me/message/ZXZ3RMSGOHPOH1" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-gold transition-colors">
              <MessageCircle size={20} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-sans mb-6 text-gold">Explore</h4>
          <ul className="space-y-4 font-light text-sm">
            <li><Link to="/new-arrivals" className="hover:text-gold transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition-colors">All Essences</Link></li>
            <li><Link to="/vision" className="hover:text-gold transition-colors">Our Vision</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-sans mb-6 text-gold">Support</h4>
          <ul className="space-y-4 font-light text-sm">
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            <li><Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-gold transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl mt-20 pt-8 border-t border-earth/30 flex flex-col md:flex-row justify-between items-center text-xs font-sans text-ivory/40">
        <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-center text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Kashume. All rights reserved.</p>
          <p>Powered by <a href="https://lunarai.agency/" target="_blank" rel="noopener noreferrer" className="hover:text-ivory transition-colors">LunarAi</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;