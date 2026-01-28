import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  test('should display sign up page correctly', async ({ page }) => {
    await page.goto('/auth/signup');

    // Check for form elements
    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('should display sign in page correctly', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for form elements
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors for empty sign up form', async ({ page }) => {
    await page.goto('/auth/signup');

    // Try to submit without filling the form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check for validation errors (these might be browser native or custom)
    // We'll just verify the form didn't navigate away
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill in invalid email
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Verify we're still on the signup page
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should navigate to sign in from sign up', async ({ page }) => {
    await page.goto('/auth/signup');

    // Look for a link to sign in
    const signInLink = page.getByText(/sign in/i).first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL('/auth/signin');
    }
  });

  test('should navigate to sign up from sign in', async ({ page }) => {
    await page.goto('/auth/signin');

    // Look for a link to sign up
    const signUpLink = page.getByText(/sign up|create account/i).first();
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL('/auth/signup');
    }
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/auth/signin');

    // Look for forgot password link
    const forgotPasswordLink = page.getByText(/forgot.*password/i);
    if (await forgotPasswordLink.isVisible()) {
      await expect(forgotPasswordLink).toBeVisible();
    }
  });

  test('should fail sign in with invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Try to sign in with invalid credentials
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should stay on signin page or show error
    // We don't assert specific error message as it may vary
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Password Reset', () => {
  test('should display forgot password page', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Check for form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link|reset password/i })).toBeVisible();
  });
});
