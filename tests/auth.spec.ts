import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check login page elements
    await expect(page.locator('h1:has-text("GitScrub")')).toBeVisible();
    await expect(page.locator('label:has-text("Personal Access Token")')).toBeVisible();
    await expect(page.locator('input#token')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in with Token")')).toBeVisible();
  });

  test('should show error for invalid token', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid token
    await page.fill('input#token', 'invalid_token_12345');
    await page.click('button:has-text("Sign in with Token")');
    
    // Should show error message for invalid token format
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Invalid token format');
  });

  test('should allow continuing without authentication', async ({ page }) => {
    await page.goto('/login');
    
    // Check that continue without auth button exists
    const continueButton = page.locator('button:has-text("Continue without authentication")');
    await expect(continueButton).toBeVisible();
    
    // Click it and verify navigation
    await continueButton.click();
    await expect(page).toHaveURL('/');
  });

  test('should show logout button when authenticated', async ({ page }) => {
    // Set up fake auth for testing
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('github_auth', JSON.stringify({
        token: 'fake_token',
        user: {
          login: 'testuser',
          avatar_url: 'https://github.com/identicons/test.png'
        }
      }));
    });
    
    // Reload page
    await page.reload();
    
    // Check that user menu is visible
    await expect(page.locator('.user-menu')).toBeVisible();
    await expect(page.locator('.logout-btn')).toBeVisible();
    await expect(page.locator('.user-name')).toContainText('testuser');
  });
});