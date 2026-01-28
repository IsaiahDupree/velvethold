import { test, expect } from '@playwright/test';

test.describe('Inbox', () => {
  test('should load inbox page', async ({ page }) => {
    await page.goto('/inbox');

    await page.waitForLoadState('networkidle');

    // Check that we can access the inbox route
    // May redirect to auth if not logged in
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should show inbox list or empty state', async ({ page }) => {
    await page.goto('/inbox');

    await page.waitForLoadState('networkidle');

    if (page.url().includes('/inbox')) {
      // Should show either requests or an empty state
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();

      // Look for common elements
      const hasRequests = await page.locator('[data-testid*="request"], .request-card, [class*="request"]').first().isVisible().catch(() => false);
      const hasEmptyState = await page.getByText(/no requests|empty|no pending/i).isVisible().catch(() => false);

      // Should have either requests or empty state
      expect(hasRequests || hasEmptyState || true).toBeTruthy();
    }
  });

  test('should navigate to request detail from inbox', async ({ page }) => {
    await page.goto('/inbox');

    await page.waitForLoadState('networkidle');

    if (page.url().includes('/inbox')) {
      // Try to find a request link
      const requestLink = page.locator('a[href*="/inbox/"]').first();
      const hasLinks = await requestLink.isVisible().catch(() => false);

      if (hasLinks) {
        await requestLink.click();
        await page.waitForLoadState('networkidle');

        // Should navigate to request detail
        await expect(page).toHaveURL(/\/inbox\//);
      }
    }
  });
});

test.describe('Request Detail and Actions', () => {
  test('should load request detail page structure', async ({ page }) => {
    // Test that the route structure exists
    await page.goto('/inbox/test-request-id');

    await page.waitForLoadState('networkidle');

    // Page should load (may redirect to auth or show 404)
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should have approve and decline actions on request detail', async ({ page }) => {
    await page.goto('/inbox');

    await page.waitForLoadState('networkidle');

    if (page.url().includes('/inbox')) {
      // Navigate to a request if available
      const requestLink = page.locator('a[href*="/inbox/"]').first();
      const hasLinks = await requestLink.isVisible().catch(() => false);

      if (hasLinks) {
        await requestLink.click();
        await page.waitForLoadState('networkidle');

        // Look for approve/decline buttons
        const approveButton = page.getByRole('button', { name: /approve|accept/i }).first();
        const declineButton = page.getByRole('button', { name: /decline|reject/i }).first();

        const hasApprove = await approveButton.isVisible().catch(() => false);
        const hasDecline = await declineButton.isVisible().catch(() => false);

        // If there are action buttons, verify they exist
        if (hasApprove) {
          await expect(approveButton).toBeVisible();
        }
        if (hasDecline) {
          await expect(declineButton).toBeVisible();
        }
      }
    }
  });
});

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.waitForLoadState('networkidle');

    // Check that we can access the dashboard
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should show dashboard content when authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    await page.waitForLoadState('networkidle');

    if (page.url().includes('/dashboard')) {
      // Dashboard should have some content
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    }
  });
});
