exports.handler = async (event) => {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub OAuth not configured' }),
    };
  }

  // Get the authorization code and state from query parameters
  const { code, state } = event.queryStringParameters || {};
  
  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No authorization code provided' }),
    };
  }

  // Verify state parameter to prevent CSRF attacks
  const cookies = parseCookies(event.headers.cookie || '');
  const storedState = cookies.github_oauth_state;
  
  if (!state || state !== storedState) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid state parameter' }),
    };
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: tokenData.error_description || tokenData.error }),
      };
    }

    // Get user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch user data' }),
      };
    }

    const userData = await userResponse.json();

    // Create the auth data to send to the client
    const authData = {
      token: tokenData.access_token,
      user: {
        login: userData.login,
        id: userData.id,
        avatar_url: userData.avatar_url,
        name: userData.name,
        public_repos: userData.public_repos,
      },
    };

    // Redirect back to the app with the auth data
    const siteUrl = process.env.URL || 'http://localhost:8888';
    const redirectUrl = `${siteUrl}/auth-success?data=${encodeURIComponent(JSON.stringify(authData))}`;

    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
        // Clear the state cookie
        'Set-Cookie': 'github_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      },
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed' }),
    };
  }
};

function parseCookies(cookieString) {
  const cookies = {};
  cookieString.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = value;
    }
  });
  return cookies;
}