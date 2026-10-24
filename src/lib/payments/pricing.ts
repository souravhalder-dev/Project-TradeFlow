export interface PriceTierInput {
  minQuantity: number;
  maxQuantity: number | null;
  unitPrice: number;
}

export interface PricingCalculationResult {
  isValid: boolean;
  unitPrice: number;
  subtotal: number;
  appliedTier: PriceTierInput | null;
  error?: string;
  moq: number;
  quantity: number;
  volumeDiscountPercent?: number;
}

/**
 * Calculates wholesale tiered price for a product based on quantity and price tiers.
 * Strictly verifies MOQ and selects the optimal applicable tier.
 */
export function calculateTieredPrice(
  quantity: number,
  basePrice: number,
  moq: number,
  priceTiers: PriceTierInput[] = [],
  isSample: boolean = false,
  samplePrice?: number | null
): PricingCalculationResult {
  if (isSample) {
    const sPrice = samplePrice != null && samplePrice > 0 ? samplePrice : basePrice;
    return {
      isValid: true,
      unitPrice: sPrice,
      subtotal: Number((sPrice * quantity).toFixed(2)),
      appliedTier: null,
      moq: 1,
      quantity,
    };
  }

  if (quantity < moq) {
    return {
      isValid: false,
      unitPrice: basePrice,
      subtotal: 0,
      appliedTier: null,
      error: `Order quantity (${quantity}) is below the minimum order quantity (MOQ: ${moq}).`,
      moq,
      quantity,
    };
  }

  if (!priceTiers || priceTiers.length === 0) {
    return {
      isValid: true,
      unitPrice: basePrice,
      subtotal: Number((basePrice * quantity).toFixed(2)),
      appliedTier: null,
      moq,
      quantity,
    };
  }

  // Sort tiers by minQuantity ascending
  const sortedTiers = [...priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);

  // Find matching tier where minQuantity <= quantity and (maxQuantity === null || quantity <= maxQuantity)
  let matchingTier: PriceTierInput | null = null;

  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity) {
      if (tier.maxQuantity === null || quantity <= tier.maxQuantity) {
        matchingTier = tier;
        break;
      }
    }
  }

  // If quantity exceeds all bounded tiers, choose highest tier
  if (!matchingTier && sortedTiers.length > 0) {
    const lastTier = sortedTiers[sortedTiers.length - 1];
    if (quantity >= lastTier.minQuantity) {
      matchingTier = lastTier;
    }
  }

  const effectiveUnitPrice = matchingTier ? matchingTier.unitPrice : basePrice;
  const subtotal = Number((effectiveUnitPrice * quantity).toFixed(2));
  const baseSubtotal = Number((basePrice * quantity).toFixed(2));
  const volumeDiscountPercent =
    baseSubtotal > 0 && subtotal < baseSubtotal
      ? Number((((baseSubtotal - subtotal) / baseSubtotal) * 100).toFixed(1))
      : 0;

  return {
    isValid: true,
    unitPrice: effectiveUnitPrice,
    subtotal,
    appliedTier: matchingTier,
    moq,
    quantity,
    volumeDiscountPercent,
  };
}
