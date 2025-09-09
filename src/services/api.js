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
    return this.request(`${endpoint}${qs}`);
  }

  async post(endpoint, body, options = {}) {
    const { headers } = options || {};
    return this.request(endpoint, { method: 'POST', body, headers });
  }

  async put(endpoint, body, options = {}) {
    const { headers } = options || {};
    return this.request(endpoint, { method: 'PUT', body, headers });
  }

  async delete(endpoint, options = {}) {
    const { headers, body } = options || {};
    return this.request(endpoint, { method: 'DELETE', headers, body });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

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
          // Handle token expiration
          if (response.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              try {
                const refreshResponse = await this.refreshToken(refreshToken);
                const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.tokens;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Retry original request with new token (do not advance 429 attempt counter)
                config.headers = {
                  ...config.headers,
                  Authorization: `Bearer ${accessToken}`,
                };
                const retryResponse = await fetch(url, config);
                const retryData = await retryResponse.json();

                if (!retryResponse.ok) {
                  // If still not ok after refresh, throw
                  throw new Error(retryData?.message || 'API request failed');
                }

                return retryData;
              } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.dispatchEvent(new CustomEvent('authTokenExpired'));
                throw new Error('Session expired. Please log in again.');
              }
            } else {
              // No refresh token, redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.dispatchEvent(new CustomEvent('authTokenExpired'));
              throw new Error('Session expired. Please log in again.');
            }
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
    // Don't use the main request method to avoid infinite loops
    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
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
  async getSongs(params = {}) {
    return this.get('/music/songs', { params });
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
  async getPopularSongs(limit = 20, genre) {
    return this.get('/music/popular', { 
      params: { limit, genre } 
    });
  }

  // Get personalized recommendations
  async getRecommendations(limit = 20) {
    return this.get('/music/recommendations', { 
      params: { limit } 
    });
  }

  // Get songs by genre
  async getSongsByGenre(genre, limit = 20) {
    return this.get(`/music/genres/${genre}`, { 
      params: { limit } 
    });
  }

  // ===== PLAYLIST API METHODS =====

  // Get user's playlists
  async getPlaylists() {
    return this.get('/music/playlists');
  }

  // Create new playlist
  async createPlaylist(playlistData) {
    return this.post('/music/playlists', playlistData);
  }

  // Get playlist by ID
  async getPlaylist(id) {
    return this.get(`/music/playlists/${id}`);
  }

  // Add song to playlist
  async addSongToPlaylist(playlistId, songId) {
    return this.post(`/music/playlists/${playlistId}/songs`, { songId });
  }

  // Remove song from playlist
  async removeSongFromPlaylist(playlistId, songId) {
    return this.delete(`/music/playlists/${playlistId}/songs/${songId}`);
  }

  // Follow/unfollow playlist
  async followPlaylist(playlistId) {
    return this.post(`/music/playlists/${playlistId}/follow`);
  }

  // ===== USER MUSIC ACTIONS =====

  // Like/unlike song
  async likeSong(songId) {
    return this.post(`/music/songs/${songId}/like`);
  }

  // Get user's liked songs
  async getLikedSongs() {
    return this.get('/music/liked-songs');
  }

  // Get user's recently played songs
  async getRecentSongs() {
    return this.get('/music/recent');
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
