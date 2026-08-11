import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getEffectiveProductPrice } from '../lib/discountUtils';

const LOCAL_STORAGE_DISCOUNTS_KEY = 'kashume_discounts_fallback';

const DiscountContext = createContext({
  discounts: [],
  loading: true,
  fetchDiscounts: () => {},
  applyDiscountToProduct: (product) => ({ ...product }),
  setDiscountsState: () => {}
});

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_DISCOUNTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  const syncLocalDiscounts = (data) => {
    setDiscounts(data);
    try {
      localStorage.setItem(LOCAL_STORAGE_DISCOUNTS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save discounts to local storage:", e);
    }
  };

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (!url || url.includes('placeholder')) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Discounts fetch error from Supabase, using cached discounts:", error.message);
      } else if (data) {
        syncLocalDiscounts(data);
      }
    } catch (err) {
      console.warn("Discounts fetch exception:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();

    // Refresh every minute to ensure schedule transitions trigger smoothly
    const interval = setInterval(() => {
      fetchDiscounts();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchDiscounts]);

  const applyDiscountToProduct = useCallback((product) => {
    if (!product) return product;
    const calc = getEffectiveProductPrice(product, discounts);
    if (calc.hasDiscount) {
      return {
        ...product,
        price: calc.price,
        original_price: calc.originalPrice,
        discount_badge: calc.badge,
        discount_title: calc.discountTitle,
        has_active_discount: true
      };
    }
    return product;
  }, [discounts]);

  return (
    <DiscountContext.Provider value={{
      discounts,
      loading,
      fetchDiscounts,
      syncLocalDiscounts,
      applyDiscountToProduct,
      setDiscounts
    }}>
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscounts = () => useContext(DiscountContext);
