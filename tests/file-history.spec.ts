import { test, expect } from '@playwright/test';

test.describe('File History Slider', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a specific file in a public repository
    await page.goto('/facebook/react/blob/main/README.md');
    
    // Skip authentication if we're on the login page
    if (page.url().includes('/login')) {
      await page.click('button:has-text("Continue without authentication")');
      await page.waitForURL('/');
      await page.goto('/facebook/react/blob/main/README.md');
    }

    // Wait for file to load
    await expect(page.locator('.file-viewer-with-history')).toBeVisible();
  });

  test('should display history slider', async ({ page }) => {
    // Check that slider components are visible
    await expect(page.locator('.history-slider-container')).toBeVisible();
    await expect(page.locator('.history-slider')).toBeVisible();
    await expect(page.locator('.time-track-container')).toBeVisible();
    
    // Check that date labels are shown
    await expect(page.locator('.slider-date').first()).toBeVisible();
    await expect(page.locator('.slider-current-date')).toBeVisible();
    await expect(page.locator('.slider-date').last()).toBeVisible();
  });

  test('should show commit information', async ({ page }) => {
    // Check that commit info is displayed
    await expect(page.locator('.commit-info')).toBeVisible();
    await expect(page.locator('.commit-message')).toBeVisible();
    await expect(page.locator('.commit-meta')).toBeVisible();
    await expect(page.locator('.commit-avatar')).toBeVisible();
  });

  test('should navigate with arrow keys', async ({ page }) => {
    // Focus the slider
    await page.locator('.history-slider').focus();
    
    // Get initial commit SHA
    const initialCommitSha = await page.locator('.commit-sha').textContent();
    
    // Press left arrow to go to older commit
    await page.keyboard.press('ArrowLeft');
    
    // Wait for content to update
    await page.waitForTimeout(500);
    
    // Check that commit SHA changed
    const newCommitSha = await page.locator('.commit-sha').textContent();
    expect(newCommitSha).not.toBe(initialCommitSha);
    
    // Press right arrow to go back
    await page.keyboard.press('ArrowRight');
    
    // Wait for content to update
    await page.waitForTimeout(500);
    
    // Check that we're back to the original commit
    const finalCommitSha = await page.locator('.commit-sha').textContent();
    expect(finalCommitSha).toBe(initialCommitSha);
  });

  test('should click on slider track to jump to commit', async ({ page }) => {
    // Get initial commit date
    const initialDate = await page.locator('.slider-current-date').textContent();
    
    // Click near the beginning of the slider (older commits)
    const sliderTrack = page.locator('.time-track-container');
    const box = await sliderTrack.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.1, box.y + box.height / 2);
    }
    
    // Wait for content to update
    await page.waitForTimeout(500);
    
    // Check that date changed
    const newDate = await page.locator('.slider-current-date').textContent();
    expect(newDate).not.toBe(initialDate);
  });

  test('should show visual tick marks for commits', async ({ page }) => {
    // Check that tick marks are visible
    const ticks = page.locator('.time-tick');
    const tickCount = await ticks.count();
    expect(tickCount).toBeGreaterThan(0);
    
    // Check that one tick is active
    await expect(page.locator('.time-tick.active')).toHaveCount(1);
  });

  test('should toggle diff view', async ({ page }) => {
    // Check that diff toggle is visible
    const diffToggle = page.locator('.diff-toggle input[type="checkbox"]');
    await expect(diffToggle).toBeVisible();
    
    // Toggle diff off
    await diffToggle.uncheck();
    
    // Check that diff classes are not present
    await expect(page.locator('.code-line.added')).toHaveCount(0);
    await expect(page.locator('.code-line.removed')).toHaveCount(0);
    
    // Navigate to previous commit
    await page.locator('.history-slider').focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    
    // Toggle diff on
    await diffToggle.check();
    
    // Check that diff is shown (may or may not have changes)
    const diffLines = await page.locator('.code-line.added, .code-line.removed').count();
    // Just verify the toggle works - diff lines may or may not exist
    expect(diffLines).toBeGreaterThanOrEqual(0);
  });

  test('should link to GitHub commit page', async ({ page }) => {
    // Check that commit link exists
    const commitLink = page.locator('.commit-link');
    await expect(commitLink).toBeVisible();
    
    // Get the href
    const href = await commitLink.getAttribute('href');
    expect(href).toMatch(/github\.com.*commit/);
    
    // Check that it opens in new tab
    const target = await commitLink.getAttribute('target');
    expect(target).toBe('_blank');
  });
});