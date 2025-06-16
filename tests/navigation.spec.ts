import { test, expect } from '@playwright/test';

test.describe('Repository Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to repository from home page', async ({ page }) => {
    // Set up fake auth to access home page
    await page.evaluate(() => {
      localStorage.setItem('github_auth', JSON.stringify({
        token: 'fake_token',
        user: {
          login: 'testuser',
          avatar_url: 'https://github.com/identicons/test.png'
        }
      }));
    });
    
    // Now navigate to home
    await page.goto('/');

    // Enter a public repository URL
    await page.fill('input[placeholder*="github.com/owner/repository"]', 'https://github.com/microsoft/TypeScript');
    await page.click('button:has-text("Explore Repository")');

    // Wait for repository page to load
    await expect(page).toHaveURL(/.*microsoft\/TypeScript/);
    
    // Check that the file tree is visible
    await expect(page.locator('.file-tree')).toBeVisible();
    
    // Check that repository name is in header
    await expect(page.locator('.repo-link')).toContainText('microsoft/TypeScript');
  });

  test('should display file tree', async ({ page }) => {
    // Navigate directly to a repository
    await page.goto('/microsoft/TypeScript');
    
    // Skip authentication if we're on the login page
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/microsoft/TypeScript');
    }

    // Wait for file tree to load
    await expect(page.locator('.file-tree')).toBeVisible();
    
    // Check that some common files/folders are visible
    await expect(page.locator('.tree-node-name:has-text("src")')).toBeVisible();
    await expect(page.locator('.tree-node-name:has-text("README.md")')).toBeVisible();
  });

  test('should navigate to a file when clicked', async ({ page }) => {
    await page.goto('/microsoft/TypeScript');
    
    // Skip authentication if we're on the login page
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/microsoft/TypeScript');
    }

    // Wait for file tree
    await expect(page.locator('.file-tree')).toBeVisible();
    
    // Click on README.md
    await page.click('.tree-node-name:has-text("README.md")');
    
    // Check that file viewer is shown
    await expect(page.locator('.file-viewer-with-history')).toBeVisible();
    await expect(page.locator('.file-header h3')).toContainText('README.md');
  });
});