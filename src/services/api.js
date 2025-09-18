const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Convenience helpers to align with axios-like usage elsewhere
  buildQueryString(params = {}) {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && `${v}` !== '');
    if (entries.length === 0) return '';
    const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
    return `?${search}`;
  }

  async get(endpoint, options = {}) {
    const { params, headers } = options || {};
    const qs = this.buildQueryString(params);
    return this.request(`${endpoint}${qs}`, { headers, suppressAuthRedirect: options.suppressAuthRedirect });
  }

  async post(endpoint, body, options = {}) {
    const { headers } = options || {};
    console.log('POST request:', { endpoint, body, options });
    return this.request(endpoint, { method: 'POST', body, headers, suppressAuthRedirect: options.suppressAuthRedirect });
  }

  async put(endpoint, body, options = {}) {
    const { headers } = options || {};
    return this.request(endpoint, { method: 'PUT', body, headers, suppressAuthRedirect: options.suppressAuthRedirect });
  }

  async delete(endpoint, options = {}) {
    const { headers, body } = options || {};
    return this.request(endpoint, { method: 'DELETE', headers, body, suppressAuthRedirect: options.suppressAuthRedirect });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let token = localStorage.getItem('accessToken');

    // Debug logging
    if (endpoint.includes('/music/')) {
      console.log('API Request Debug:', {
        endpoint,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...'
      });
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const max429Retries = 3;

    const baseConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    let config = { ...baseConfig };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    let refreshedOnce = false;
    for (let attempt = 0; attempt <= max429Retries; attempt++) {
      try {
        const response = await fetch(url, config);
        let data;
        try {
          data = await response.json();
        } catch {
          data = undefined;
        }

        if (!response.ok) {
          console.log(`API request failed with status ${response.status} for ${endpoint}`);
          
          // Handle token expiration: try one refresh then retry original request once
          if (response.status === 401) {
            const storedRefresh = localStorage.getItem('refreshToken');
            if (storedRefresh && !refreshedOnce) {
              try {
                const refreshData = await this.refreshToken(storedRefresh);
                const newAccess = refreshData?.data?.tokens?.accessToken || refreshData?.accessToken;
                const newRefresh = refreshData?.data?.tokens?.refreshToken || refreshData?.refreshToken;
                if (newAccess) localStorage.setItem('accessToken', newAccess);
                if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
                // Notify app that tokens were refreshed
                try {
                  window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: { accessToken: newAccess, refreshToken: newRefresh } }));
                } catch {}
                // Update Authorization header and retry once
                token = newAccess || token;
                config = {
                  ...config,
                  headers: {
                    ...config.headers,
                    ...(token && { Authorization: `Bearer ${token}` })
                  }
                };
                refreshedOnce = true;
                // retry immediately without increasing attempt counter
                const retryResp = await fetch(url, config);
                let retryData;
                try { retryData = await retryResp.json(); } catch { retryData = undefined; }
                if (!retryResp.ok) {
                  // Refresh succeeded but retry failed: fall through to redirect/return error
                  if (retryResp.status === 401 && !options.suppressAuthRedirect) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.dispatchEvent(new CustomEvent('authTokenExpired'));
                  }
                  throw new Error((retryData && retryData.message) || 'API request failed after refresh');
                }
                return retryData;
              } catch (refreshErr) {
                console.error('Token refresh failed:', refreshErr);
                if (!options.suppressAuthRedirect) {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('user');
                  window.dispatchEvent(new CustomEvent('authTokenExpired'));
                }
                return { error: 'Authentication failed' };
              }
            }
            // No refresh token or already refreshed
            if (!options.suppressAuthRedirect) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.dispatchEvent(new CustomEvent('authTokenExpired'));
            }
            return { error: 'Authentication failed' };
          }

          // Handle rate limiting with backoff
          if (response.status === 429 && attempt < max429Retries) {
            const retryAfterHeader = response.headers.get('Retry-After');
            const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;
            const backoffMs = retryAfterMs || Math.min(1000 * 2 ** attempt + Math.random() * 250, 8000);
            await sleep(backoffMs);
            continue; // retry loop
          }

          // Handle validation errors
          if (response.status === 400 && data && data.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors.map(error => error.msg).join(', ');
            throw new Error(errorMessages);
          }

          throw new Error((data && data.message) || 'API request failed');
        }

        // OK
        return data;
      } catch (error) {
        // Network or parsing error: if we were handling 429, the loop would continue.
        // For other errors, rethrow immediately.
        if (attempt >= max429Retries) {
          console.error('API Error:', error);
          throw error;
        }
      }
    }
  }

  // Authentication endpoints
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async googleAuth(credential) {
    return this.request('/auth/google', {
      method: 'POST',
      body: { credential },
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  }

  async refreshToken(refreshToken) {
    console.log('Attempting token refresh with token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
    
    // Don't use the main request method to avoid infinite loops
    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    console.log('Refresh token response status:', response.status);

    const data = await response.json();
    console.log('Refresh token response data:', data);

    if (!response.ok) {
      console.error('Token refresh failed:', data);
      throw new Error(data.message || 'Token refresh failed');
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async verifyEmail(token) {
    return this.request(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async updateProfilePicture(picture) {
    return this.request('/user/profile-picture', {
      method: 'PUT',
      body: { picture },
    });
  }

  async updatePreferences(preferences) {
    return this.request('/user/preferences', {
      method: 'PUT',
      body: preferences,
    });
  }

  async changePassword(passwordData) {
    return this.request('/user/change-password', {
      method: 'PUT',
      body: passwordData,
    });
  }

  async deleteAccount(confirmationData) {
    return this.request('/user/account', {
      method: 'DELETE',
      body: confirmationData,
    });
  }

  async getUserStats() {
    return this.request('/user/stats');
  }

  // Subscription endpoints
  async updateSubscription({ accountType, subscriptionExpires = null }) {
    return this.request('/user/subscription', {
      method: 'PUT',
      body: { accountType, subscriptionExpires },
    });
  }

  // Social endpoints
  async getAllUsers() {
    return this.request('/user/all');
  }

  async followUser(userId) {
    return this.request(`/user/follow/${userId}`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId) {
    return this.request(`/user/follow/${userId}`, {
      method: 'DELETE',
    });
  }

  async cancelFollowRequest(userId) {
    return this.request(`/user/follow/${userId}/cancel`, {
      method: 'POST',
    });
  }

  // ===== MUSIC API METHODS =====

  // Get all songs with filters
  async getSongs(params = {}, options = {}) {
    return this.get('/music/songs', { params, ...options });
  }

  // Get song by ID
  async getSong(id) {
    return this.get(`/music/songs/${id}`);
  }

  // Search songs
  async searchMusic(query, type = 'song', limit = 20, source = 'all') {
    return this.get('/music/search', { 
      params: { q: query, type, limit, source } 
    });
  }

  // Get popular songs
  async getPopularSongs(limit = 20, genre, options = {}) {
    return this.get('/music/popular', { 
      params: { limit, genre },
      ...options
    });
  }

  // Get personalized recommendations
  async getRecommendations(limit = 20, options = {}) {
    return this.get('/music/recommendations', { 
      params: { limit },
      ...options
    });
  }

  // Get songs by genre
  async getSongsByGenre(genre, limit = 20) {
    return this.get(`/music/genres/${genre}`, { 
      params: { limit } 
    });
  }

  // ===== ARTISTS =====
  async getArtists(params = {}) {
    return this.get('/music/artists', { params });
  }

  async followArtist(name, options = {}) {
    const qs = this.buildQueryString({ name });
    return this.post(`/user/follow-artist${qs}`, { name }, options);
  }

  async getArtistProfile(name) {
    const encoded = encodeURIComponent(name);
    return this.get(`/music/artist/${encoded}`);
  }

  // ===== PLAYLIST API METHODS =====

  // Get user's playlists
  async getPlaylists(options = {}) {
    return this.get('/music/playlists', options);
  }

  // Create new playlist
  async createPlaylist(playlistData, options = {}) {
    return this.post('/music/playlists', playlistData, options);
  }

  // Get playlist by ID
  async getPlaylist(id, options = {}) {
    return this.get(`/music/playlists/${id}`, options);
  }

  // Add song to playlist
  async addSongToPlaylist(playlistId, songId, options = {}) {
    console.log('addSongToPlaylist called with:', { playlistId, songId, options });
    const body = { songId };
    console.log('Request body:', body);
    return this.post(`/music/playlists/${playlistId}/songs`, body, options);
  }

  // Remove song from playlist
  async removeSongFromPlaylist(playlistId, songId, options = {}) {
    return this.delete(`/music/playlists/${playlistId}/songs/${songId}`, options);
  }

  // Follow/unfollow playlist
  async followPlaylist(playlistId, options = {}) {
    return this.post(`/music/playlists/${playlistId}/follow`, undefined, options);
  }

  // ===== USER MUSIC ACTIONS =====

  // Like/unlike song
  async likeSong(songId, options = {}) {
    return this.post(`/music/songs/${songId}/like`, undefined, options);
  }

  // Get user's liked songs
  async getLikedSongs(options = {}) {
    return this.get('/music/liked-songs', options);
  }

  // Get user's recently played songs
  async getRecentSongs(options = {}) {
    return this.get('/music/recent', options);
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export default new ApiService();
