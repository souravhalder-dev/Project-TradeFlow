import { describe, it, expect } from 'vitest';
import { generateOrderNumber, formatCurrency, slugify } from '../utils';

describe('Orders and Commercial Utilities', () => {
  it('generates unique enterprise order numbers prefixed with TF-', () => {
    const num1 = generateOrderNumber();
    const num2 = generateOrderNumber();
    expect(num1).toMatch(/^TF-\d{8}-\d{4}$/);
    expect(num2).toMatch(/^TF-\d{8}-\d{4}$/);
    expect(num1).not.toBe(num2);
  });

  it('accurately formats wholesale monetary values with explicit ISO currencies', () => {
    expect(formatCurrency(12450.5, 'USD')).toBe('$12,450.50');
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
    expect(formatCurrency(null, 'USD')).toBe('$0.00');
  });

  it('slugifies titles safely for URL routing', () => {
    expect(slugify('Apex GaN 140W USB-C Charger & Hub!')).toBe('apex-gan-140w-usb-c-charger-hub');
    expect(slugify('5-Axis CNC Water-Cooled Spindle (24,000 RPM)')).toBe('5-axis-cnc-water-cooled-spindle-24000-rpm');
  });
});
