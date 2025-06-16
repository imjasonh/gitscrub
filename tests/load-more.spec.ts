import { test, expect } from '@playwright/test';

test.describe('Load More Commits', () => {
  test('should load more commits when available', async ({ page }) => {
    // Use a repository with many commits
    await page.goto('/torvalds/linux/blob/master/README');
    
    // Skip authentication if we're on the login page
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/torvalds/linux/blob/master/README');
    }

    // Wait for file to load
    await expect(page.locator('.file-viewer-with-history')).toBeVisible();
    
    // Wait for commits to load
    await page.waitForTimeout(2000);
    
    // Check if load more button is available (it should be for Linux repo)
    const loadMoreButton = page.locator('.load-more-btn');
    
    if (await loadMoreButton.isVisible()) {
      // Count initial tick marks
      const initialTickCount = await page.locator('.time-tick').count();
      
      // Click load more
      await loadMoreButton.click();
      
      // Wait for loading to complete
      await expect(page.locator('.loading-more')).toBeVisible();
      await expect(page.locator('.loading-more')).toBeHidden({ timeout: 30000 });
      
      // Count tick marks after loading
      const newTickCount = await page.locator('.time-tick').count();
      
      // Should have more commits now
      expect(newTickCount).toBeGreaterThan(initialTickCount);
      
      // Current position should be maintained
      const activeTicks = await page.locator('.time-tick.active').count();
      expect(activeTicks).toBe(1);
    }
  });

  test('should maintain slider position when loading more', async ({ page }) => {
    await page.goto('/facebook/react/blob/main/packages/react/README.md');
    
    // Skip authentication if we're on the login page
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/facebook/react/blob/main/packages/react/README.md');
    }

    // Wait for file to load
    await expect(page.locator('.file-viewer-with-history')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Navigate to an older commit first
    await page.locator('.history-slider').focus();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(200);
    }
    
    // Get current commit SHA
    const currentCommitSha = await page.locator('.commit-sha').textContent();
    
    // Load more if available
    const loadMoreButton = page.locator('.load-more-btn');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      
      // Wait for loading to complete
      await expect(page.locator('.loading-more')).toBeVisible();
      await expect(page.locator('.loading-more')).toBeHidden({ timeout: 30000 });
      
      // Check that we're still on the same commit
      const newCommitSha = await page.locator('.commit-sha').textContent();
      expect(newCommitSha).toBe(currentCommitSha);
    }
  });
});