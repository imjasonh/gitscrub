exports.handler = async (event) => {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  
  if (!CLIENT_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub client ID not configured' }),
    };
  }

  // Get the redirect URI from the request or use a default
  const siteUrl = process.env.URL || 'http://localhost:8888';
  const redirectUri = `${siteUrl}/.netlify/functions/auth-callback`;
  
  // Generate a random state parameter for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in a cookie for validation later
  const stateCookie = `github_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`;
  
  // Build the GitHub OAuth authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo read:user',
    state: state,
  });
  
  const authUrl = `https://github.com/login/oauth/authorize?${params}`;
  
  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      'Set-Cookie': stateCookie,
    },
  };
};