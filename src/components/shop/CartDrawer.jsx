import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

import { Link } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { state, dispatch, calculateTotals } = useCart();
  const { total, savings, appliedBundles } = calculateTotals();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-ivory z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-8 flex justify-between items-center border-b border-earth/10">
              <h2 className="text-2xl font-serif">Your Selection</h2>
              <button onClick={onClose} className="p-2 hover:bg-earth/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {state.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-charcoal/40 font-light">
                  <ShoppingBag size={48} className="mb-4 opacity-20" />
                  <p>Your bag is empty.</p>
                </div>
              ) : (
                state.items.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-32 bg-earth/5 overflow-hidden flex-shrink-0">
                      <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 py-2 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-light">{item.name}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-charcoal/40 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="font-sans text-sm">Rs. {item.price}</span>
                        <button 
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {state.items.length > 0 && (
              <div className="p-8 bg-white border-t border-earth/10">
                {/* Applied Bundles Notification - The "Outclass" Factor */}
                {appliedBundles.length > 0 && (
                  <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-lg">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-2">Bundle Detected</p>
                    {appliedBundles.map((bundle, bIdx) => (
                      <div key={bIdx} className="text-sm font-light text-earth/80 italic">
                        "{bundle.name}" pricing applied.
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-light">
                    <span>Subtotal</span>
                    <span>Rs. {total + savings}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-gold">
                      <span>Bundle Savings</span>
                      <span>-Rs. {savings}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-serif pt-4 border-t border-earth/5">
                    <span>Total</span>
                    <span>Rs. {total}</span>
                  </div>
                </div>

                <Link 
                  to="/checkout"
                  onClick={onClose}
                  className="w-full bg-charcoal text-ivory py-5 text-xs uppercase tracking-[0.3em] hover:bg-gold hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 shadow-xl"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
