import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../shop/CartDrawer';
import SearchOverlay from '../shop/SearchOverlay';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ variant = 'dark' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const itemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  // Determine text color based on scroll and variant
  const isLight = variant === 'light' && !isScrolled && !isMobileMenuOpen;
  const textColor = isLight ? 'text-ivory' : 'text-charcoal';
  const subTextColor = isLight ? 'text-ivory/70' : 'text-charcoal/70';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'All Products', path: '/shop' },
    { name: 'Bundles', path: '/bundles' },
    { name: 'Vision', path: '/vision' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? 'py-4 bg-[#F5F2ED]/95 backdrop-blur-md shadow-sm border-b border-charcoal/5'
            : 'py-8 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 relative flex justify-between items-center h-full">
          {/* Left: Navigation Links (Desktop) */}
          <div className={`hidden md:flex flex-1 gap-8 items-center text-[10px] uppercase tracking-[0.3em] font-sans ${subTextColor} transition-colors duration-500`}>
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="hover:text-gold transition-colors duration-300 whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Center: Brand Identity */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center pointer-events-auto">
            <Link 
              to="/" 
              className={`text-2xl md:text-4xl font-serif tracking-[0.3em] ${textColor} uppercase transition-all duration-500 hover:scale-105 inline-block font-bold`}
            >
              Kashume
            </Link>
          </div>

          {/* Right: Functional Icons */}
          <div className={`flex flex-1 gap-4 md:gap-6 items-center justify-end ${textColor} transition-colors duration-500`}>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-gold transition-colors duration-300 hidden md:block"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            <Link 
              to="/account" 
              className="hover:text-gold transition-colors duration-300"
              title="Account"
            >
              <User size={18} strokeWidth={1.5} className={user ? 'text-gold' : ''} />
            </Link>
            
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_CART', payload: true })}
              className="relative hover:text-gold transition-colors duration-300"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-sans font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            
            <button 
              className="md:hidden p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden bg-[#F5F2ED] border-t border-charcoal/5 overflow-hidden"
            >
              <div className="flex flex-col items-center py-12 gap-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                  >
                    <Link 
                      to={link.path} 
                      className="text-xs uppercase tracking-[0.4em] text-charcoal hover:text-gold transition-colors font-bold"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.1 + 0.2 }}
                  className="flex flex-col gap-6 items-center"
                >
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="text-xs uppercase tracking-[0.4em] text-charcoal hover:text-gold transition-colors font-bold flex items-center gap-2"
                  >
                    <Search size={14} /> Search
                  </button>
                  <Link 
                    to="/account" 
                    className="text-xs uppercase tracking-[0.4em] text-charcoal hover:text-gold transition-colors font-bold"
                  >
                    Account
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartDrawer isOpen={state.isCartOpen} onClose={() => dispatch({ type: 'TOGGLE_CART', payload: false })} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
