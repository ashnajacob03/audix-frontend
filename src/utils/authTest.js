// Test authentication flow
export const testAuthFlow = async () => {
  console.log('=== TESTING AUTH FLOW ===');
  
  // Test 1: Check current auth state
  const user = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('Current state:', {
    hasUser: !!user,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    userEmail: user ? JSON.parse(user).email : null
  });
  
  if (!accessToken) {
    console.log('No access token found - user needs to login');
    return false;
  }
  
  // Test 2: Test API call with current token
  try {
    console.log('Testing API call with current token...');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/auth/test-auth`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Profile API test:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    if (response.ok) {
      console.log('✅ Token is valid');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Token expired, testing refresh...');
      
      // Test 3: Test token refresh
      if (refreshToken) {
        try {
          console.log('Attempting token refresh...');
          const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          const refreshData = await refreshResponse.json();
          
          console.log('Refresh test:', {
            status: refreshResponse.status,
            ok: refreshResponse.ok,
            hasNewTokens: !!(refreshData.data?.tokens),
            message: refreshData.message
          });
          
          if (refreshResponse.ok && refreshData.data?.tokens) {
            console.log('✅ Token refresh successful');
            localStorage.setItem('accessToken', refreshData.data.tokens.accessToken);
            localStorage.setItem('refreshToken', refreshData.data.tokens.refreshToken);
            
            // Test the new token
            console.log('Testing API call with new token...');
            const newResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/auth/test-auth`, {
              headers: {
                'Authorization': `Bearer ${refreshData.data.tokens.accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            console.log('New token test:', {
              status: newResponse.status,
              ok: newResponse.ok
            });
            
            return newResponse.ok;
          } else {
            console.log('❌ Token refresh failed:', refreshData);
            return false;
          }
        } catch (refreshError) {
          console.log('❌ Token refresh error:', refreshError);
          return false;
        }
      } else {
        console.log('❌ No refresh token available');
        return false;
      }
    } else {
      console.log('❌ API call failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API test error:', error);
    return false;
  }
};

// Test specific API endpoints
export const testMusicAPIs = async () => {
  console.log('=== TESTING MUSIC APIs ===');
  
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.log('No access token available');
    return;
  }
  
  const endpoints = [
    '/music/liked-songs',
    '/music/playlists',
    '/music/recommendations?limit=5'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`Error details:`, errorData);
      }
    } catch (error) {
      console.log(`${endpoint} error:`, error);
    }
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testAuthFlow = testAuthFlow;
  window.testMusicAPIs = testMusicAPIs;
}