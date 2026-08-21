/**
 * Checks if a discount is currently active based on dates and active flag
 */
export const isDiscountActive = (discount, targetTime = new Date()) => {
  if (!discount || discount.is_active === false) return false;
  
  if (discount.start_date) {
    const startDate = new Date(discount.start_date);
    if (isNaN(startDate.getTime()) || targetTime < startDate) return false;
  }
  
  if (discount.end_date) {
    const endDate = new Date(discount.end_date);
    if (isNaN(endDate.getTime()) || targetTime > endDate) return false;
  }
  
  return true;
};

/**
 * Computes effective price and discount info for a product
 */
export const getEffectiveProductPrice = (product, discounts = []) => {
  const basePrice = parseFloat(product?.original_price || product?.price || 0);
  if (!product || !discounts || discounts.length === 0 || basePrice <= 0) {
    return {
      hasDiscount: false,
      originalPrice: product?.original_price ? parseFloat(product.original_price) : null,
      price: parseFloat(product?.price || 0),
      badge: null,
      discountTitle: null,
      discount: null
    };
  }

  const now = new Date();

  // Find all active discounts applicable to this product
  const applicableDiscounts = discounts.filter(d => {
    if (!isDiscountActive(d, now)) return false;
    const pId = String(product.id);
    const targetId = String(d.product_id);
    return targetId === 'all' || targetId === pId;
  });

  if (applicableDiscounts.length === 0) {
    return {
      hasDiscount: false,
      originalPrice: product?.original_price ? parseFloat(product.original_price) : null,
      price: parseFloat(product?.price || 0),
      badge: null,
      discountTitle: null,
      discount: null
    };
  }

  // Prioritize specific product discount over site-wide ('all'), or highest savings
  applicableDiscounts.sort((a, b) => {
    const aIsSpecific = String(a.product_id) !== 'all';
    const bIsSpecific = String(b.product_id) !== 'all';
    if (aIsSpecific && !bIsSpecific) return -1;
    if (!aIsSpecific && bIsSpecific) return 1;

    // Calculate discount amount for comparison
    const aVal = a.discount_type === 'percentage' 
      ? basePrice * (parseFloat(a.discount_value) / 100) 
      : parseFloat(a.discount_value);
    const bVal = b.discount_type === 'percentage' 
      ? basePrice * (parseFloat(b.discount_value) / 100) 
      : parseFloat(b.discount_value);
    return bVal - aVal;
  });

  const bestDiscount = applicableDiscounts[0];
  const value = parseFloat(bestDiscount.discount_value || 0);
  let discountAmount = 0;
  let percentValue = 0;

  if (bestDiscount.discount_type === 'percentage') {
    discountAmount = basePrice * (value / 100);
    percentValue = Math.round(value);
  } else {
    discountAmount = value;
    percentValue = Math.max(1, Math.round((value / basePrice) * 100));
  }

  const discountedPrice = Math.max(0, Math.round(basePrice - discountAmount));
  const savingsAmount = Math.max(0, Math.round(basePrice - discountedPrice));
  const percentageText = `${percentValue}% OFF`;
  
  // Format badge text intelligently:
  // If title exists (e.g. "Azadi Sale" or "Independence Day Sale") and doesn't already contain percentage/OFF,
  // combine title and percentage: "Azadi Sale • 30% OFF"
  let badgeLabel = bestDiscount.title ? bestDiscount.title.trim() : '';
  if (badgeLabel) {
    const hasPercentOrOff = /%\s*off|%|off/i.test(badgeLabel);
    if (!hasPercentOrOff) {
      badgeLabel = `${badgeLabel} • ${percentageText}`;
    }
  } else {
    badgeLabel = percentageText;
  }

  const rawTitle = bestDiscount.title?.trim() || 'Azadi Sale';

  return {
    hasDiscount: true,
    originalPrice: basePrice,
    price: discountedPrice,
    badge: badgeLabel,
    discountTitle: rawTitle,
    discountPercentage: percentValue,
    percentageText: percentageText,
    savingsAmount: savingsAmount,
    discountType: bestDiscount.discount_type,
    discountValue: value,
    discount: bestDiscount
  };
};

