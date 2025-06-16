import { test as base } from '@playwright/test';

// Extend basic test with our auth setup
export const test = base.extend({
  // Set up authenticated context
  context: async ({ context }, use) => {
    // For tests, we'll mock authentication by setting localStorage
    // This simulates a user who has already authenticated via OAuth
    await context.addInitScript(() => {
      const auth = {
        token: 'test_oauth_token_12345',
        user: {
          login: 'test-user',
          id: 12345,
          name: 'Test User',
          avatar_url: 'https://github.com/identicons/test.png',
          public_repos: 10
        }
      };
      localStorage.setItem('github_auth', JSON.stringify(auth));
    });
    
    await use(context);
  },
});

export { expect } from '@playwright/test';