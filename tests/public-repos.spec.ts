import { test, expect } from '@playwright/test';

test.describe('Public Repository Access', () => {
  test('should access public repository without authentication', async ({ page }) => {
    // Go directly to a public repository
    await page.goto('/microsoft/TypeScript');
    
    // If redirected to login, continue without auth
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      
      // Navigate again to the repository
      await page.goto('/microsoft/TypeScript');
    }
    
    // Should see the file tree
    await expect(page.locator('.file-tree')).toBeVisible({ timeout: 10000 });
    
    // Should see repository name in header
    await expect(page.locator('.repo-link')).toContainText('microsoft/TypeScript');
  });

  test('should view file history in public repository', async ({ page }) => {
    // Go directly to a file in a public repository
    await page.goto('/facebook/react/blob/main/README.md');
    
    // If redirected to login, continue without auth
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      
      // Navigate again to the file
      await page.goto('/facebook/react/blob/main/README.md');
    }
    
    // Wait for file viewer to load
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 10000 });
    
    // Check that history slider is present
    await expect(page.locator('.history-slider')).toBeVisible();
    await expect(page.locator('.time-track-container')).toBeVisible();
    
    // Check for tick marks
    const ticks = await page.locator('.time-tick').count();
    expect(ticks).toBeGreaterThan(0);
  });

  test('should navigate commits with keyboard', async ({ page }) => {
    // Go directly to a small file with history
    await page.goto('/facebook/react/blob/main/.gitignore');
    
    // If redirected to login, continue without auth
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/facebook/react/blob/main/.gitignore');
    }
    
    // Wait for file to load
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 10000 });
    
    // Focus the slider
    await page.locator('.history-slider').focus();
    
    // Get initial commit SHA
    const initialSha = await page.locator('.commit-sha').textContent();
    
    // Press left arrow to go to older commit
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    
    // SHA should change
    const newSha = await page.locator('.commit-sha').textContent();
    expect(newSha).not.toBe(initialSha);
    
    // Press right arrow to go back
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    
    // Should be back to original
    const finalSha = await page.locator('.commit-sha').textContent();
    expect(finalSha).toBe(initialSha);
  });

  test('should click on slider to jump to commit', async ({ page }) => {
    // Go to a file with history
    await page.goto('/facebook/react/blob/main/LICENSE');
    
    // If redirected to login, continue without auth
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/facebook/react/blob/main/LICENSE');
    }
    
    // Wait for file to load
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 10000 });
    
    // Get initial date
    const initialDate = await page.locator('.slider-current-date').textContent();
    
    // Click near the beginning of the slider
    const track = page.locator('.time-track-container');
    const box = await track.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.1, box.y + box.height / 2);
      await page.waitForTimeout(500);
      
      // Date should change
      const newDate = await page.locator('.slider-current-date').textContent();
      expect(newDate).not.toBe(initialDate);
    }
  });

  test('should click on slider tick marks to jump to specific commits', async ({ page }) => {
    // Go to a file with history
    await page.goto('/facebook/react');
    
    // If redirected to login, continue without auth
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/facebook/react');
    }
    
    // Wait for file tree and click a small file
    await expect(page.locator('.file-tree')).toBeVisible({ timeout: 10000 });
    await page.click('.tree-node-name:has-text(".gitignore")');
    
    // Wait for file viewer to load
    await expect(page.locator('.file-viewer-with-history')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Get all tick marks
    const ticks = page.locator('.time-tick');
    const tickCount = await ticks.count();
    expect(tickCount).toBeGreaterThan(3);
    
    // Get initial commit SHA
    const initialSha = await page.locator('.commit-sha').textContent();
    
    // Find a tick around 30% from the left (older)
    const targetIndex = Math.floor(tickCount * 0.3);
    const targetTick = ticks.nth(targetIndex);
    const targetPosition = await targetTick.evaluate(el => parseFloat(el.style.left));
    
    // Click on that position
    const container = page.locator('.time-track-container');
    const box = await container.boundingBox();
    if (box) {
      const clickX = box.x + (box.width * targetPosition / 100);
      const clickY = box.y + box.height / 2;
      
      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(500);
      
      // Verify commit changed
      const newSha = await page.locator('.commit-sha').textContent();
      expect(newSha).not.toBe(initialSha);
      
      // Verify active tick is at or near clicked position
      const activeTick = page.locator('.time-tick.active');
      const activePosition = await activeTick.evaluate(el => parseFloat(el.style.left));
      
      // Should be within reasonable distance (accounting for snapping)
      expect(Math.abs(activePosition - targetPosition)).toBeLessThan(10);
      
      // Verify thumb position matches
      const thumb = page.locator('.time-thumb');
      const thumbPosition = await thumb.evaluate(el => parseFloat(el.style.left));
      expect(Math.abs(thumbPosition - activePosition)).toBeLessThan(1);
    }
  });
});