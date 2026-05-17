import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const cartItemId = action.payload.selectedSize ? `${action.payload.id}-${action.payload.selectedSize}` : action.payload.id;
      const existing = state.items.find(i => (i.cartItemId || i.id) === cartItemId);
      let newItems;
      if (existing) {
        newItems = state.items.map(i => (i.cartItemId || i.id) === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1, cartItemId }];
      }
      return { ...state, items: newItems, isCartOpen: true };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => (i.cartItemId || i.id) !== action.payload) };
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: action.payload ?? !state.isCartOpen };
    case 'SET_BUNDLES':
      return { ...state, availableBundles: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], availableBundles: [], isCartOpen: false });

  /**
   * Complex Bundle Logic: "Outclass" Strategy
   * Calculates the best price by detecting if the cart contains items that form a predefined bundle.
   */
  const calculateTotals = () => {
    let subtotal = 0;
    let savings = 0;
    let remainingItems = [...state.items.flatMap(item => Array(item.quantity).fill({ ...item, quantity: 1 }))];
    const appliedBundles = [];

    // Sort bundles by most items first to prioritize larger savings
    const sortedBundles = [...state.availableBundles].sort((a, b) => b.product_ids.length - a.product_ids.length);

    sortedBundles.forEach(bundle => {
      let canFormBundle = true;
      while (canFormBundle) {
        const indicesToToRemove = [];
        const matchFound = bundle.product_ids.every(pid => {
          const index = remainingItems.findIndex(item => item.id === pid);
          if (index !== -1) {
            indicesToToRemove.push(index);
            return true;
          }
          return false;
        });

        if (matchFound && indicesToToRemove.length > 0) {
          // Add bundle price to total
          subtotal += parseFloat(bundle.price);
          appliedBundles.push(bundle);
          
          // Calculate theoretical savings
          const originalPrice = indicesToToRemove.reduce((acc, idx) => acc + parseFloat(remainingItems[idx].price), 0);
          savings += (originalPrice - parseFloat(bundle.price));

          // Remove "consumed" items from calculation
          indicesToToRemove.sort((a, b) => b - a).forEach(idx => remainingItems.splice(idx, 1));
        } else {
          canFormBundle = false;
        }
      }
    });

    // Add remaining individual items
    remainingItems.forEach(item => {
      subtotal += parseFloat(item.price);
    });

    const shipping = subtotal < 3000 && subtotal > 0 ? 199 : 0;

    return { subtotal, total: subtotal + shipping, shipping, savings, appliedBundles };
  };

  return (
    <CartContext.Provider value={{ state, dispatch, calculateTotals }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
