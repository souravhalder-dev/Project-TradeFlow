import { test, expect } from '@playwright/test';

test.describe('TradeFlow B2B Wholesale Marketplace E2E Workflows', () => {
  test('1. Homepage loads successfully with branding, categories, and verified suppliers', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TradeFlow/);

    // Verify Brand Logo and Hero
    await expect(page.locator('text=TradeFlow').first()).toBeVisible();
    await expect(page.locator('text=Connect Directly with Verified Manufacturers')).toBeVisible();

    // Verify Categories and Products
    await expect(page.locator('text=Explore Industry Categories')).toBeVisible();
    await expect(page.locator('text=Featured Wholesale Catalog')).toBeVisible();
    await expect(page.locator('text=Verified Enterprise Manufacturers')).toBeVisible();
  });

  test('2. Product catalog search and filtering works', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1')).toContainText('Wholesale Product Marketplace');

    // Filter by keyword
    await page.goto('/products?q=Headphones');
    await expect(page.locator('text=Apex Pro Sound X7').first()).toBeVisible();
  });

  test('3. Product details page renders tiered pricing table and MOQ controls', async ({ page }) => {
    await page.goto('/products/apex-pro-sound-x7-hybrid-anc-wireless-headphones');
    await expect(page.locator('h1')).toContainText('Apex Pro Sound X7');

    // Verify MOQ badge and Tiered Pricing
    await expect(page.locator('text=Wholesale Tiered Pricing')).toBeVisible();
    await expect(page.locator('text=MOQ: 50 Pieces').first()).toBeVisible();

    // Verify Manufacturer Card
    await expect(page.locator('text=Apex Global Electronics Ltd.')).toBeVisible();
    await expect(page.locator('text=Gold Verified Manufacturer')).toBeVisible();
  });

  test('4. Request for Quotation (RFQ) creation page renders with specs editor', async ({ page }) => {
    await page.goto('/rfq/new');
    await expect(page.locator('h1')).toContainText('Submit Request for Quotation (RFQ)');
    await expect(page.locator('text=Product & Sourcing Specifications')).toBeVisible();
    await expect(page.locator('text=Technical Key-Value Parameters')).toBeVisible();
  });

  test('5. Verified Manufacturer Directory renders certified factory profiles', async ({ page }) => {
    await page.goto('/suppliers');
    await expect(page.locator('h1')).toContainText('Verified Manufacturer Directory');
    await expect(page.locator('text=Apex Global Electronics Ltd.').first()).toBeVisible();
  });

  test('6. Unauthorized users cannot access administrative endpoints without privileges', async ({ request }) => {
    const res = await request.get('/api/admin/stats');
    expect([401, 403]).toContain(res.status());
  });
});
