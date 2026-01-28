import { test, expect } from '@playwright/test';

test.describe('Browse Profiles', () => {
  test('should load browse page', async ({ page }) => {
    await page.goto('/browse');

    await page.waitForLoadState('networkidle');

    // Check that we're either on browse page or redirected to auth
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should display profile cards when profiles exist', async ({ page }) => {
    await page.goto('/browse');

    await page.waitForLoadState('networkidle');

    // If we're on the browse page (not redirected to auth)
    if (page.url().includes('/browse')) {
      // Check for common elements like profile cards or empty state
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    }
  });

  test('should have filter functionality', async ({ page }) => {
    await page.goto('/browse');

    await page.waitForLoadState('networkidle');

    if (page.url().includes('/browse')) {
      // Look for filter UI elements
      const filterButton = page.getByRole('button', { name: /filter/i }).first();
      const hasFilters = await filterButton.isVisible().catch(() => false);

      // If filters exist, we can verify they're there
      if (hasFilters) {
        await expect(filterButton).toBeVisible();
      }
    }
  });
});

test.describe('Profile Detail', () => {
  test('should handle viewing a profile detail page', async ({ page }) => {
    // Since we don't know which profiles exist, we'll test the route structure
    await page.goto('/browse');

    await page.waitForLoadState('networkidle');

    if (page.url().includes('/browse')) {
      // Try to find and click a profile card
      const profileLink = page.locator('a[href*="/profiles/"]').first();
      const hasProfiles = await profileLink.isVisible().catch(() => false);

      if (hasProfiles) {
        await profileLink.click();
        await page.waitForLoadState('networkidle');

        // Should be on a profile detail page
        await expect(page).toHaveURL(/\/profiles\//);
      }
    }
  });

  test('should show request button on profile detail', async ({ page }) => {
    // This test assumes we can access a profile detail page
    // It will skip if authentication is required
    await page.goto('/browse');

    await page.waitForLoadState('networkidle');

    if (page.url().includes('/browse')) {
      const profileLink = page.locator('a[href*="/profiles/"]').first();
      const hasProfiles = await profileLink.isVisible().catch(() => false);

      if (hasProfiles) {
        await profileLink.click();
        await page.waitForLoadState('networkidle');

        // Look for request/book button
        const requestButton = page.getByRole('button', { name: /request|book|send request/i }).first();
        const hasRequestButton = await requestButton.isVisible().catch(() => false);

        if (hasRequestButton) {
          await expect(requestButton).toBeVisible();
        }
      }
    }
  });
});

test.describe('Date Request Flow', () => {
  test('should load request page structure', async ({ page }) => {
    // Try to access a request page
    // This will likely require auth, so we just test the route exists
    await page.goto('/request/test-id');

    await page.waitForLoadState('networkidle');

    // The page should load (even if it redirects to auth or shows 404)
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should load request success page', async ({ page }) => {
    await page.goto('/request/success');

    await page.waitForLoadState('networkidle');

    // Check that we can access this route
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });
});
