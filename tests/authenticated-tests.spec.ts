import { test, expect } from '@playwright/test';

test.describe('Authenticated Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication using the token from env
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      throw new Error('GITHUB_TOKEN not found in environment. Please set it in .env.test');
    }
    
    await page.goto('/');
    await page.evaluate((token) => {
      // Store auth with real token
      const auth = {
        token: token,
        user: null // Will be fetched by the app
      };
      localStorage.setItem('github_auth', JSON.stringify(auth));
    }, token);
  });

  test('should navigate to repository with auth', async ({ page }) => {
    // Navigate directly to a repository
    await page.goto('/facebook/react');
    
    // Should see file tree without errors
    await expect(page.locator('.file-tree')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.repo-link')).toContainText('facebook/react');
    
    // Should NOT see error
    await expect(page.locator('.error')).not.toBeVisible();
  });

  test('should view file history with slider', async ({ page }) => {
    // Go to repository
    await page.goto('/facebook/react');
    await expect(page.locator('.file-tree')).toBeVisible({ timeout: 15000 });
    
    // Click on README
    await page.locator('.tree-node-name').filter({ hasText: 'README.md' }).click();
    
    // Should see file viewer with history
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.history-slider')).toBeVisible();
    await expect(page.locator('.time-track-container')).toBeVisible();
    
    // Should have tick marks
    const ticks = await page.locator('.time-tick').count();
    expect(ticks).toBeGreaterThan(0);
  });

  test('should navigate commits with keyboard', async ({ page }) => {
    // Navigate to file
    await page.goto('/facebook/react');
    await expect(page.locator('.file-tree')).toBeVisible({ timeout: 15000 });
    
    await page.locator('.tree-node-name').filter({ hasText: '.gitignore' }).click();
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 15000 });
    
    // Wait for commits to load
    await page.waitForSelector('.time-tick');
    await page.waitForTimeout(1000);
    
    // Get initial state
    const initialSha = await page.locator('.commit-sha').textContent();
    
    // Focus slider and navigate
    await page.locator('.history-slider').focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    
    // Should have changed
    const newSha = await page.locator('.commit-sha').textContent();
    expect(newSha).not.toBe(initialSha);
    
    // Go back
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    
    const finalSha = await page.locator('.commit-sha').textContent();
    expect(finalSha).toBe(initialSha);
  });

  test('should click on slider to jump to specific commit', async ({ page }) => {
    // Navigate to file
    await page.goto('/facebook/react');
    await expect(page.locator('.file-tree')).toBeVisible({ timeout: 15000 });
    
    await page.locator('.tree-node-name').filter({ hasText: 'LICENSE' }).click();
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 15000 });
    
    // Wait for commits
    await page.waitForSelector('.time-tick');
    await page.waitForTimeout(1000);
    
    // Get initial state
    const initialDate = await page.locator('.slider-current-date').textContent();
    const initialSha = await page.locator('.commit-sha').textContent();
    
    // Get tick marks
    const ticks = page.locator('.time-tick');
    const tickCount = await ticks.count();
    console.log('Number of commits:', tickCount);
    
    // Click at 25% position
    const container = page.locator('.time-track-container');
    const box = await container.boundingBox();
    
    if (box) {
      const clickX = box.x + box.width * 0.25;
      const clickY = box.y + box.height / 2;
      
      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(500);
      
      // Verify changes
      const newDate = await page.locator('.slider-current-date').textContent();
      const newSha = await page.locator('.commit-sha').textContent();
      
      expect(newDate).not.toBe(initialDate);
      expect(newSha).not.toBe(initialSha);
      
      // Verify visual feedback
      await expect(page.locator('.time-tick.active')).toHaveCount(1);
      
      // Verify thumb position
      const thumb = page.locator('.time-thumb');
      await expect(thumb).toBeVisible();
      
      const activeTick = page.locator('.time-tick.active');
      const activePos = await activeTick.evaluate(el => parseFloat(el.style.left));
      const thumbPos = await thumb.evaluate(el => parseFloat(el.style.left));
      
      // Positions should match
      expect(Math.abs(thumbPos - activePos)).toBeLessThan(1);
      console.log(`Clicked at 25%, active tick at ${activePos}%`);
    }
  });

  test('should load more commits when available', async ({ page }) => {
    // Use a repo with many commits
    await page.goto('/torvalds/linux');
    await expect(page.locator('.file-tree')).toBeVisible({ timeout: 15000 });
    
    // Click on README
    await page.locator('.tree-node-name').filter({ hasText: 'README' }).first().click();
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 15000 });
    
    // Wait for initial commits
    await page.waitForTimeout(2000);
    
    // Check if load more is available
    const loadMoreBtn = page.locator('.load-more-btn');
    if (await loadMoreBtn.isVisible()) {
      const initialTicks = await page.locator('.time-tick').count();
      console.log('Initial commits:', initialTicks);
      
      // Click load more
      await loadMoreBtn.click();
      await expect(page.locator('.loading-more')).toBeVisible();
      await expect(page.locator('.loading-more')).not.toBeVisible({ timeout: 30000 });
      
      // Should have more commits
      const newTicks = await page.locator('.time-tick').count();
      console.log('After loading more:', newTicks);
      expect(newTicks).toBeGreaterThan(initialTicks);
    }
  });
});