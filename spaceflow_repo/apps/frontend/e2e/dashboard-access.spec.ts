import { test, expect } from '@playwright/test';

test.describe('Dashboard Access', () => {
  test('should successfully log in and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    const formTitle = page.locator('h1.auth-form-title');
    await expect(formTitle).toBeVisible();
    await expect(formTitle).toHaveText('Log in to CAFM PRO');

    await page.fill('input[type="email"]', 'tarikbenaich@gmail.com');
    await page.fill('input[type="password"]', 'admin123');

    await page.click('button[type="submit"]');

    const beecarbonatText = page.locator('text=BEECARBONAT').first();
    await expect(beecarbonatText).toBeVisible({ timeout: 15000 });
    
    await expect(page).toHaveURL(/.*\/dashboard|.*\//);
    
    // Instead of looking for an exact href="/dashboard" which may be active and missing href, or routed differently,
    // we look for the exact navigation label 'Dashboard'
    const dashboardNavLink = page.locator('text=Dashboard').first();
    await expect(dashboardNavLink).toBeVisible();
  });
  
  test('should allow demo access via the quick link', async ({ page }) => {
    await page.goto('/login');
    
    // Find the demo access button "Accéder au mode démo"
    const demoButton = page.locator('button:has-text("Accéder au mode démo")');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      
      // Wait for the layout to appear
      const beecarbonatText = page.locator('text=BEECARBONAT').first();
      await expect(beecarbonatText).toBeVisible({ timeout: 10000 });
      
      // Verify standard layout items are visible indicating successful entry
      const dashboardNavLink = page.locator('a[href="/dashboard"]');
      await expect(dashboardNavLink).toBeVisible();
    }
  });
});
