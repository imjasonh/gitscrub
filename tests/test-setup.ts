import { test as base } from '@playwright/test';

// Extend basic test with our auth setup
export const test = base.extend({
  // Set up authenticated context
  context: async ({ context }, use) => {
    // Get token from environment
    const token = process.env.GITHUB_TOKEN;
    
    if (token) {
      // Set up localStorage with the token before each test
      await context.addInitScript((token) => {
        const auth = {
          token: token,
          user: {
            login: 'test-user',
            name: 'Test User',
            avatar_url: 'https://github.com/identicons/test.png'
          }
        };
        localStorage.setItem('github_auth', JSON.stringify(auth));
      }, token);
    }
    
    await use(context);
  },
});

export { expect } from '@playwright/test';