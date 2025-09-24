/**
 * Type definitions for the professional advertisement system
 */

export interface AdConfig {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  videoUrl?: string;
  imageUrl?: string;
  duration: number; // in seconds
  type: 'audio' | 'video' | 'display';
  priority: number; // higher number = higher priority
  targetAudience?: string[];
  isActive: boolean;
}

export interface AdCampaign {
  id: string;
  name: string;
  ads: AdConfig[];
  startDate: Date;
  endDate: Date;
  budget?: number;
  impressions?: number;
  clicks?: number;
}

export interface ListeningSession {
  startTime: number;
  totalTime: number;
  lastAdTime: number;
  sessionId: string;
}

export interface AdSchedule {
  nextAdAt: number; // timestamp when next ad should play
  adInterval: number; // 10 minutes in milliseconds
  isAdDue: boolean;
}
