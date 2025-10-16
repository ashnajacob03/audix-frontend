/**
 * Professional Ad Scheduler
 * Manages ad scheduling based on listening time and user preferences
 */

import listeningTimeTracker from './listeningTimeTracker';
import { type AdConfig, type AdCampaign } from '../types/adTypes';

// Re-export types for backward compatibility
export type { AdConfig, AdCampaign };

class AdScheduler {
  private adCampaigns: AdCampaign[] = [];
  private currentAd: AdConfig | null = null;
  private isAdPlaying = false;
  private adListeners: Set<(ad: AdConfig | null) => void> = new Set();
  private adQueue: AdConfig[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeDefaultAds();
    this.setupListeningTimeIntegration();
  }

  /**
   * Initialize the ad scheduler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadAdCampaigns();
      this.isInitialized = true;
      console.log('📺 Ad Scheduler initialized');
    } catch (error) {
      console.error('Failed to initialize ad scheduler:', error);
      this.isInitialized = true; // Continue with default ads
    }
  }

  /**
   * Check if an ad should be played based on listening time
   */
  shouldPlayAd(): boolean {
    return listeningTimeTracker.shouldPlayAd() && !this.isAdPlaying;
  }

  /**
   * Get the next ad to play
   */
  getNextAd(): AdConfig | null {
    if (this.adQueue.length === 0) {
      this.refreshAdQueue();
    }

    return this.adQueue.length > 0 ? this.adQueue[0] : null;
  }

  /**
   * Play the next scheduled ad
   */
  async playNextAd(): Promise<AdConfig | null> {
    if (this.isAdPlaying) {
      console.warn('Ad is already playing');
      return null;
    }

    const ad = this.getNextAd();
    if (!ad) {
      console.warn('No ads available to play');
      return null;
    }

    this.currentAd = ad;
    this.isAdPlaying = true;
    this.adQueue.shift(); // Remove the ad from queue

    // Mark ad as played in listening time tracker
    listeningTimeTracker.markAdPlayed();

    // Notify listeners
    this.notifyAdListeners(ad);

    console.log(`📺 Playing ad: ${ad.title}`);
    return ad;
  }

  /**
   * Mark current ad as finished
   */
  finishCurrentAd(): void {
    if (this.currentAd) {
      console.log(`📺 Finished ad: ${this.currentAd.title}`);
      this.currentAd = null;
    }
    this.isAdPlaying = false;
    this.notifyAdListeners(null);
  }

  /**
   * Skip current ad (for premium users or manual skip)
   */
  skipCurrentAd(): void {
    if (this.isAdPlaying) {
      console.log('📺 Ad skipped');
      this.finishCurrentAd();
    }
  }

  /**
   * Subscribe to ad events
   */
  subscribe(callback: (ad: AdConfig | null) => void): () => void {
    this.adListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.adListeners.delete(callback);
    };
  }

  /**
   * Get current ad
   */
  getCurrentAd(): AdConfig | null {
    return this.currentAd;
  }

  /**
   * Check if ad is currently playing
   */
  isAdCurrentlyPlaying(): boolean {
    return this.isAdPlaying;
  }

  /**
   * Get time until next ad
   */
  getTimeUntilNextAd(): number {
    return listeningTimeTracker.getTimeUntilNextAd();
  }

  /**
   * Get formatted time until next ad
   */
  getFormattedTimeUntilNextAd(): string {
    return listeningTimeTracker.getFormattedTimeUntilNextAd();
  }

  /**
   * Add a new ad campaign
   */
  addAdCampaign(campaign: AdCampaign): void {
    this.adCampaigns.push(campaign);
    this.refreshAdQueue();
    console.log(`📺 Added ad campaign: ${campaign.name}`);
  }

  /**
   * Remove an ad campaign
   */
  removeAdCampaign(campaignId: string): void {
    this.adCampaigns = this.adCampaigns.filter(c => c.id !== campaignId);
    this.refreshAdQueue();
    console.log(`📺 Removed ad campaign: ${campaignId}`);
  }

  /**
   * Get all active ad campaigns
   */
  getActiveCampaigns(): AdCampaign[] {
    const now = new Date();
    return this.adCampaigns.filter(campaign => 
      campaign.startDate <= now && 
      campaign.endDate >= now &&
      campaign.ads.some(ad => ad.isActive)
    );
  }

  /**
   * Get ad statistics
   */
  getAdStats(): {
    totalCampaigns: number;
    activeCampaigns: number;
    totalAds: number;
    activeAds: number;
    queueLength: number;
  } {
    const activeCampaigns = this.getActiveCampaigns();
    const totalAds = this.adCampaigns.reduce((sum, campaign) => sum + campaign.ads.length, 0);
    const activeAds = activeCampaigns.reduce((sum, campaign) => 
      sum + campaign.ads.filter(ad => ad.isActive).length, 0
    );

    return {
      totalCampaigns: this.adCampaigns.length,
      activeCampaigns: activeCampaigns.length,
      totalAds,
      activeAds,
      queueLength: this.adQueue.length
    };
  }

  /**
   * Initialize default ads for the app
   */
  private initializeDefaultAds(): void {
    const defaultCampaign: AdCampaign = {
      id: 'default_campaign',
      name: 'Audix Default Ads',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2025, 11, 31),
      ads: [
        {
          id: 'audix_premium_promo',
          title: 'Upgrade to Audix Premium',
          description: 'Enjoy unlimited music without ads',
          audioUrl: '/ads/Audixad.mp3',
          duration: 10,
          type: 'audio',
          priority: 10,
          isActive: true
        },
        {
          id: 'audix_features',
          title: 'Discover Audix Features',
          description: 'Explore playlists, recommendations, and more',
          audioUrl: '/ads/Audixad.mp3',
          duration: 8,
          type: 'audio',
          priority: 8,
          isActive: true
        }
      ]
    };

    this.adCampaigns.push(defaultCampaign);
    this.refreshAdQueue();
  }

  /**
   * Setup integration with listening time tracker
   */
  private setupListeningTimeIntegration(): void {
    // Subscribe to listening time updates
    listeningTimeTracker.subscribe(({ isAdDue }) => {
      if (isAdDue && !this.isAdPlaying) {
        console.log('📺 Ad is due based on listening time');
        // The audio player will check shouldPlayAd() and trigger the ad
      }
    });
  }

  /**
   * Refresh the ad queue with available ads
   */
  private refreshAdQueue(): void {
    const activeCampaigns = this.getActiveCampaigns();
    const availableAds: AdConfig[] = [];

    // Collect all active ads from active campaigns
    activeCampaigns.forEach(campaign => {
      campaign.ads
        .filter(ad => ad.isActive)
        .forEach(ad => availableAds.push(ad));
    });

    // Sort by priority (higher priority first)
    availableAds.sort((a, b) => b.priority - a.priority);

    // Shuffle ads with same priority for variety
    const priorityGroups = new Map<number, AdConfig[]>();
    availableAds.forEach(ad => {
      if (!priorityGroups.has(ad.priority)) {
        priorityGroups.set(ad.priority, []);
      }
      priorityGroups.get(ad.priority)!.push(ad);
    });

    this.adQueue = [];
    priorityGroups.forEach(ads => {
      // Shuffle ads within same priority group
      const shuffled = [...ads].sort(() => Math.random() - 0.5);
      this.adQueue.push(...shuffled);
    });

    console.log(`📺 Refreshed ad queue with ${this.adQueue.length} ads`);
  }

  /**
   * Load ad campaigns from external source (API, localStorage, etc.)
   */
  private async loadAdCampaigns(): Promise<void> {
    // This could be extended to load from an API
    // For now, we'll use the default ads
    try {
      const stored = localStorage.getItem('audix_ad_campaigns');
      if (stored) {
        const campaigns = JSON.parse(stored);
        this.adCampaigns = campaigns.map((campaign: any) => ({
          ...campaign,
          startDate: new Date(campaign.startDate),
          endDate: new Date(campaign.endDate)
        }));
        this.refreshAdQueue();
      }
    } catch (error) {
      console.warn('Failed to load ad campaigns from storage:', error);
    }
  }

  /**
   * Save ad campaigns to storage
   */
  // private saveAdCampaigns(): void { // unused
  //   try {
  //     localStorage.setItem('audix_ad_campaigns', JSON.stringify(this.adCampaigns));
  //   } catch (error) {
  //     console.warn('Failed to save ad campaigns to storage:', error);
  //   }
  // }

  /**
   * Notify ad listeners
   */
  private notifyAdListeners(ad: AdConfig | null): void {
    this.adListeners.forEach(callback => {
      try {
        callback(ad);
      } catch (error) {
        console.error('Error in ad listener:', error);
      }
    });
  }
}

// Create singleton instance
export const adScheduler = new AdScheduler();

// Initialize when module loads
adScheduler.initialize();

export default adScheduler;
