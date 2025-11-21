import { test, expect } from '@playwright/test';

test.describe('Delete Post Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');

    // Login with your credentials
    await page.fill('input[name="emailOrUsername"]', 'Navada25');
    await page.fill('input[name="password"]', 'Navadaonline2025!');
    await page.click('button[type="submit"]');

    // Wait for redirect to feed
    await page.waitForURL('/feed');
  });

  test('should show delete button for own posts and delete specific post', async ({ page }) => {
    // Navigate to feed
    await page.goto('/feed');

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 10000 });

    // Find the specific post by its caption
    const postCard = page.locator('[data-testid="post-card"]').filter({
      hasText: 'Navada online!!!!'
    });

    // Check if post exists
    await expect(postCard).toBeVisible({ timeout: 5000 });

    // Look for delete button within this specific post
    const deleteButton = postCard.locator('[data-testid="delete-post-button"]');

    // Debug: Take screenshot to see current state
    await page.screenshot({ path: 'before-delete.png' });

    // Check if delete button is visible
    if (await deleteButton.count() > 0) {
      console.log('Delete button found!');

      // Click delete button
      await deleteButton.click();

      // Handle confirmation dialog
      page.on('dialog', async dialog => {
        console.log('Dialog text:', dialog.message());
        await dialog.accept();
      });

      // Wait for post to be removed from DOM
      await expect(postCard).not.toBeVisible({ timeout: 5000 });

      console.log('Post deleted successfully!');
    } else {
      console.log('Delete button not found. Debugging...');

      // Debug: Log all buttons in the post
      const buttons = await postCard.locator('button').all();
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        const buttonClass = await buttons[i].getAttribute('class');
        console.log(`Button ${i}: "${buttonText}" - classes: ${buttonClass}`);
      }

      // Debug: Check user ID in localStorage
      const userJson = await page.evaluate(() => localStorage.getItem('user'));
      const user = userJson ? JSON.parse(userJson) : null;
      console.log('Current user ID:', user?._id || user?.id);
      console.log('Post author ID: 6920a4b29d1c20a3cd51c4ad');

      throw new Error('Delete button not found for the post');
    }
  });

  test('should directly call delete API for specific post', async ({ page }) => {
    // Test direct API call
    const response = await page.request.delete('/api/posts/6920a4ef9d1c20a3cd51c4b6', {
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`
      }
    });

    console.log('Delete API response status:', response.status());
    console.log('Delete API response:', await response.text());

    if (response.status() === 200) {
      console.log('Post deleted via API successfully!');
    } else {
      console.log('Failed to delete post via API');
    }
  });
});