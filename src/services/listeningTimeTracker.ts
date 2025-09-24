/**
 * Professional Listening Time Tracker
 * Tracks total listening time and manages ad scheduling every 10 minutes
 */

import { type ListeningSession, type AdSchedule } from '../types/adTypes';

class ListeningTimeTracker {
  private session: ListeningSession | null = null;
  private adSchedule: AdSchedule = {
    nextAdAt: 0,
    adInterval: 10 * 60 * 1000, // 10 minutes in milliseconds
    isAdDue: false
  };
  private isTracking = false;
  private listeners: Set<(data: { totalTime: number; isAdDue: boolean }) => void> = new Set();
  private storageKey = 'audix_listening_time';
  private adScheduleKey = 'audix_ad_schedule';

  constructor() {
    this.loadFromStorage();
    this.initializeSession();
  }

  /**
   * Start tracking listening time
   */
  startTracking(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.initializeSession();
    console.log('🎵 Started tracking listening time');
  }

  /**
   * Stop tracking listening time
   */
  stopTracking(): void {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    this.saveToStorage();
    console.log('⏹️ Stopped tracking listening time');
  }

  /**
   * Pause tracking (user paused music)
   */
  pauseTracking(): void {
    if (!this.isTracking || !this.session) return;
    
    const now = Date.now();
    const sessionDuration = now - this.session.startTime;
    this.session.totalTime += sessionDuration;
    this.session.startTime = now; // Reset start time for when we resume
    
    this.saveToStorage();
    console.log('⏸️ Paused tracking listening time');
  }

  /**
   * Resume tracking (user resumed music)
   */
  resumeTracking(): void {
    if (!this.isTracking || !this.session) return;
    
    this.session.startTime = Date.now();
    console.log('▶️ Resumed tracking listening time');
  }

  /**
   * Get current total listening time in milliseconds
   */
  getTotalListeningTime(): number {
    if (!this.session) return 0;
    
    const now = Date.now();
    const currentSessionTime = this.isTracking ? now - this.session.startTime : 0;
    
    return this.session.totalTime + currentSessionTime;
  }

  /**
   * Get total listening time in minutes
   */
  getTotalListeningTimeMinutes(): number {
    return Math.floor(this.getTotalListeningTime() / (1000 * 60));
  }

  /**
   * Check if an ad should be played
   */
  shouldPlayAd(): boolean {
    const totalTime = this.getTotalListeningTime();
    const timeSinceLastAd = totalTime - this.adSchedule.nextAdAt;
    
    // First ad should play immediately (at 0 minutes)
    if (this.adSchedule.nextAdAt === 0) {
      // First ad should play immediately when user starts listening
      return totalTime >= 0;
    }
    
    // Subsequent ads every 10 minutes
    return timeSinceLastAd >= this.adSchedule.adInterval;
  }

  /**
   * Mark that an ad has been played
   */
  markAdPlayed(): void {
    const totalTime = this.getTotalListeningTime();
    // Set next ad to play 10 minutes from now
    this.adSchedule.nextAdAt = totalTime + this.adSchedule.adInterval;
    this.adSchedule.isAdDue = false;
    
    this.saveToStorage();
    this.notifyListeners();
    console.log('📺 Ad marked as played. Next ad in 10 minutes');
  }

  /**
   * Get time until next ad in milliseconds
   */
  getTimeUntilNextAd(): number {
    const totalTime = this.getTotalListeningTime();
    
    if (this.adSchedule.nextAdAt === 0) {
      // First ad should play immediately
      return 0;
    }
    
    // Time until the scheduled next ad
    return Math.max(0, this.adSchedule.nextAdAt - totalTime);
  }

  /**
   * Get time until next ad in minutes
   */
  getTimeUntilNextAdMinutes(): number {
    return Math.ceil(this.getTimeUntilNextAd() / (1000 * 60));
  }

  /**
   * Subscribe to listening time updates
   */
  subscribe(callback: (data: { totalTime: number; isAdDue: boolean }) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get formatted listening time string
   */
  getFormattedListeningTime(): string {
    const totalMinutes = this.getTotalListeningTimeMinutes();
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Get formatted time until next ad
   */
  getFormattedTimeUntilNextAd(): string {
    const minutes = this.getTimeUntilNextAdMinutes();
    if (minutes <= 0) {
      return 'Ad due now';
    }
    if (this.adSchedule.nextAdAt === 0) {
      return 'First ad ready';
    }
    return `${minutes}m until next ad`;
  }

  /**
   * Reset all tracking data
   */
  reset(): void {
    this.session = null;
    this.adSchedule = {
      nextAdAt: 0,
      adInterval: 10 * 60 * 1000,
      isAdDue: false
    };
    this.isTracking = false;
    this.saveToStorage();
    this.notifyListeners();
    console.log('🔄 Reset listening time tracking');
  }

  /**
   * Initialize a new session
   */
  private initializeSession(): void {
    const now = Date.now();
    
    if (!this.session) {
      this.session = {
        startTime: now,
        totalTime: 0,
        lastAdTime: 0,
        sessionId: this.generateSessionId()
      };
    } else {
      this.session.startTime = now;
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(): void {
    try {
      if (this.session) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.session));
      }
      localStorage.setItem(this.adScheduleKey, JSON.stringify(this.adSchedule));
    } catch (error) {
      console.warn('Failed to save listening time to storage:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const sessionData = localStorage.getItem(this.storageKey);
      if (sessionData) {
        this.session = JSON.parse(sessionData);
      }

      const adScheduleData = localStorage.getItem(this.adScheduleKey);
      if (adScheduleData) {
        this.adSchedule = { ...this.adSchedule, ...JSON.parse(adScheduleData) };
      }
    } catch (error) {
      console.warn('Failed to load listening time from storage:', error);
    }
  }

  /**
   * Notify all listeners of updates
   */
  private notifyListeners(): void {
    const data = {
      totalTime: this.getTotalListeningTime(),
      isAdDue: this.shouldPlayAd()
    };
    
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in listening time listener:', error);
      }
    });
  }

  /**
   * Start periodic updates (call this when app starts)
   */
  startPeriodicUpdates(): void {
    // Update every 30 seconds
    setInterval(() => {
      if (this.isTracking) {
        this.notifyListeners();
      }
    }, 30000);
  }
}

// Create singleton instance
export const listeningTimeTracker = new ListeningTimeTracker();

// Start periodic updates when module loads
listeningTimeTracker.startPeriodicUpdates();

export default listeningTimeTracker;
