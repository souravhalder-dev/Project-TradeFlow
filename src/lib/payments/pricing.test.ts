import { describe, it, expect } from 'vitest';
import { calculateTieredPrice } from './pricing';

describe('B2B Wholesale Tiered Pricing Calculation', () => {
  const sampleTiers = [
    { minQuantity: 50, maxQuantity: 199, unitPrice: 38.50 },
    { minQuantity: 200, maxQuantity: 999, unitPrice: 32.00 },
    { minQuantity: 1000, maxQuantity: null, unitPrice: 26.50 },
  ];

  it('rejects quantities strictly below Minimum Order Quantity (MOQ)', () => {
    const result = calculateTieredPrice(25, 38.50, 50, sampleTiers);
    expect(result.isValid).toBe(false);
    expect(result.subtotal).toBe(0);
    expect(result.error).toContain('below the minimum order quantity (MOQ: 50)');
  });

  it('correctly applies tier 1 pricing (50 - 199 units)', () => {
    const result = calculateTieredPrice(100, 45.00, 50, sampleTiers);
    expect(result.isValid).toBe(true);
    expect(result.unitPrice).toBe(38.50);
    expect(result.subtotal).toBe(3850.00);
    expect(result.appliedTier?.minQuantity).toBe(50);
  });

  it('correctly applies tier 2 volume discount (200 - 999 units)', () => {
    const result = calculateTieredPrice(500, 45.00, 50, sampleTiers);
    expect(result.isValid).toBe(true);
    expect(result.unitPrice).toBe(32.00);
    expect(result.subtotal).toBe(16000.00);
    expect(result.appliedTier?.minQuantity).toBe(200);
  });

  it('correctly applies maximum tier for large bulk orders (1000+ units)', () => {
    const result = calculateTieredPrice(2500, 45.00, 50, sampleTiers);
    expect(result.isValid).toBe(true);
    expect(result.unitPrice).toBe(26.50);
    expect(result.subtotal).toBe(66250.00);
    expect(result.appliedTier?.maxQuantity).toBeNull();
  });

  it('supports single-unit sample orders when sample mode is requested', () => {
    const result = calculateTieredPrice(1, 45.00, 50, sampleTiers, true, 65.00);
    expect(result.isValid).toBe(true);
    expect(result.unitPrice).toBe(65.00);
    expect(result.subtotal).toBe(65.00);
  });
});
