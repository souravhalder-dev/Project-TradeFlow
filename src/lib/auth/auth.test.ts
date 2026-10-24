import { describe, it, expect } from 'vitest';
import { verifyServerToken } from './firebase-admin';

describe('Server Authentication & Identity Layer', () => {
  it('rejects empty or null tokens', async () => {
    const res = await verifyServerToken('');
    expect(res).toBeNull();
  });

  it('correctly decodes and validates a buyer demo token in dev mode', async () => {
    process.env.AUTH_DEV_MODE = 'true';
    const decoded = await verifyServerToken('demo_token_buyer_123');
    expect(decoded).not.toBeNull();
    expect(decoded?.role).toBe('BUYER');
    expect(decoded?.email).toBe('buyer@globalmerch.com');
  });

  it('correctly decodes and validates a supplier demo token in dev mode', async () => {
    process.env.AUTH_DEV_MODE = 'true';
    const decoded = await verifyServerToken('demo_token_supplier_123');
    expect(decoded).not.toBeNull();
    expect(decoded?.role).toBe('SUPPLIER');
    expect(decoded?.email).toBe('supplier@apex.com');
  });

  it('correctly decodes and validates an administrator demo token in dev mode', async () => {
    process.env.AUTH_DEV_MODE = 'true';
    const decoded = await verifyServerToken('demo_token_admin_123');
    expect(decoded).not.toBeNull();
    expect(decoded?.role).toBe('ADMIN');
    expect(decoded?.email).toBe('admin@tradeflow.com');
  });
});
