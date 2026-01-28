import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle('VelvetHold - Premium Date Reservations');

    // Check hero section
    await expect(page.getByRole('heading', { name: 'Premium Date Reservations' })).toBeVisible();
    await expect(page.getByText('Filter for serious matches with deposit-based commitment')).toBeVisible();

    // Check CTA buttons
    await expect(page.getByRole('link', { name: /create profile/i })).toBeVisible();

    // Check navigation
    await expect(page.getByRole('link', { name: 'VelvetHold' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/');

    // Click on "Get Started" button
    await page.getByRole('link', { name: 'Get Started' }).click();

    // Verify we're on the sign up page
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');

    // Click on "Sign In" button
    await page.getByRole('link', { name: 'Sign In' }).click();

    // Verify we're on the sign in page
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should have "How It Works" section', async ({ page }) => {
    await page.goto('/');

    // Check for the "How It Works" section
    await expect(page.getByRole('heading', { name: 'How VelvetHold Works' })).toBeVisible();
    await expect(page.getByText('Set Your Terms')).toBeVisible();
    await expect(page.getByText('Receive Requests')).toBeVisible();
    await expect(page.getByText('Approve & Connect')).toBeVisible();
  });

  test('should have safety section', async ({ page }) => {
    await page.goto('/');

    // Check for the safety section
    await expect(page.getByRole('heading', { name: 'Safety First' })).toBeVisible();
    await expect(page.getByText('Verified Profiles')).toBeVisible();
    await expect(page.getByText('Public Meetups Only')).toBeVisible();
    await expect(page.getByText('Refundable Deposits')).toBeVisible();
    await expect(page.getByText('Privacy Protected')).toBeVisible();
  });
});
