exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  
  if (!CLIENT_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub client ID not configured' }),
    };
  }

  try {
    const { device_code } = JSON.parse(event.body);
    
    if (!device_code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Device code is required' }),
      };
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    const data = await response.json();

    // GitHub returns 200 even for pending/slow_down errors
    // Check for error in response body
    if (data.error) {
      // For authorization_pending and slow_down, return 202 to indicate client should retry
      if (data.error === 'authorization_pending' || data.error === 'slow_down') {
        return {
          statusCode: 202,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        };
      }
      // For other errors (expired_token, access_denied, etc.), return 400
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };
    }

    // Success - we have an access token
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to poll for token' }),
    };
  }
};