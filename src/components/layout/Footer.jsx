import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-ivory py-20 px-6 border-t border-earth/20">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="text-4xl font-serif tracking-widest uppercase block mb-6">
            Kashume
          </Link>
          <p className="text-ivory/60 font-light max-w-sm leading-relaxed">
            A return to the botanical. We distill time, patience, and absolute precision to craft sanctuaries for the senses.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-sans mb-6 text-gold">Explore</h4>
          <ul className="space-y-4 font-light text-sm">
            <li><Link to="/new-arrivals" className="hover:text-gold transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition-colors">All Essences</Link></li>
            <li><Link to="/vision" className="hover:text-gold transition-colors">Our Vision</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-sans mb-6 text-gold">Support</h4>
          <ul className="space-y-4 font-light text-sm">
            <li><Link to="#" className="hover:text-gold transition-colors">Contact Us</Link></li>
            <li><Link to="#" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            <li><Link to="#" className="hover:text-gold transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl mt-20 pt-8 border-t border-earth/30 flex flex-col md:flex-row justify-between items-center text-xs font-sans text-ivory/40">
        <p>&copy; {new Date().getFullYear()} Kashume. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-ivory transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;