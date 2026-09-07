import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/CAFM/);
    await expect(page.locator('h1')).toContainText('CAFM Pro');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@cafm.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Vérifier redirection dashboard
    await page.waitForURL('/crm/dashboard', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
  });
});
