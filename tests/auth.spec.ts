import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page with OAuth device flow', async ({ page }) => {
    await page.goto('/login');
    
    // Check login page elements
    await expect(page.locator('h1:has-text("GitScrub")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in with GitHub")')).toBeVisible();
    
    // Should NOT show continue without auth option
    await expect(page.locator('button:has-text("Continue without authentication")')).not.toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should redirect repository page to login when not authenticated', async ({ page }) => {
    await page.goto('/facebook/react');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should show logout button when authenticated', async ({ page }) => {
    // Set up fake auth for testing
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('github_auth', JSON.stringify({
        token: 'fake_token',
        user: {
          login: 'testuser',
          id: 12345,
          avatar_url: 'https://github.com/identicons/test.png',
          name: 'Test User',
          public_repos: 10
        }
      }));
    });
    
    // Reload page
    await page.reload();
    
    // Check that user menu is visible
    await expect(page.locator('.user-menu')).toBeVisible();
    await expect(page.locator('.logout-btn')).toBeVisible();
    await expect(page.locator('.user-name')).toContainText('Test User');
  });

  test('should clear auth on logout', async ({ page }) => {
    // Set up fake auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('github_auth', JSON.stringify({
        token: 'fake_token',
        user: {
          login: 'testuser',
          id: 12345,
          avatar_url: 'https://github.com/identicons/test.png',
          name: 'Test User',
          public_repos: 10
        }
      }));
    });
    
    await page.reload();
    
    // Click logout
    await page.click('.logout-btn');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Auth should be cleared
    const authData = await page.evaluate(() => localStorage.getItem('github_auth'));
    expect(authData).toEqual('{"token":null,"user":null}');
  });
});