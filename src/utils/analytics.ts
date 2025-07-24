import { DataManager } from './dataManager';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
}

class AnalyticsManager {
  private currentSession: UserSession | null = null;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private sessionTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.initSession();
    this.setupEventListeners();
  }
  
  /**
   * Initialize or restore session
   */
  private initSession() {
    const savedSession = DataManager.load<UserSession>('analytics_session');
    
    if (savedSession && Date.now() - savedSession.lastActivity < this.sessionTimeout) {
      this.currentSession = savedSession;
      this.resetSessionTimer();
    } else {
      this.createNewSession();
    }
  }
  
  /**
   * Create a new analytics session
   */
  private createNewSession() {
    this.currentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: []
    };
    
    this.saveSession();
    this.track('session', 'start');
  }
  
  /**
   * Save current session to storage
   */
  private saveSession() {
    if (this.currentSession) {
      DataManager.save('analytics_session', this.currentSession);
    }
  }
  
  /**
   * Reset session timeout timer
   */
  private resetSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    this.sessionTimer = setTimeout(() => {
      this.endSession();
    }, this.sessionTimeout);
  }
  
  /**
   * End current session
   */
  private endSession() {
    if (this.currentSession) {
      const duration = Date.now() - this.currentSession.startTime;
      this.track('session', 'end', undefined, duration);
      
      // Archive session
      const sessions = DataManager.load<UserSession[]>('analytics_sessions', { compress: true }) || [];
      sessions.push(this.currentSession);
      
      // Keep only last 100 sessions
      if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100);
      }
      
      DataManager.save('analytics_sessions', sessions, { compress: true });
      DataManager.remove('analytics_session');
      
      this.currentSession = null;
    }
  }
  
  /**
   * Track an analytics event
   */
  track(category: string, action: string, label?: string, value?: number) {
    if (!this.currentSession) {
      this.createNewSession();
    }
    
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.currentSession!.id,
      userId: this.getUserId()
    };
    
    this.currentSession!.events.push(event);
    this.currentSession!.lastActivity = Date.now();
    
    // Send to Google Analytics if available
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
    
    this.saveSession();
    this.resetSessionTimer();
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }
  
  /**
   * Track page view
   */
  trackPageView(path: string, title?: string) {
    if (!this.currentSession) {
      this.createNewSession();
    }
    
    this.currentSession!.pageViews++;
    this.track('navigation', 'page_view', path);
    
    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title
      });
    }
  }
  
  /**
   * Track user timing
   */
  trackTiming(category: string, variable: string, duration: number) {
    this.track('timing', category, variable, duration);
    
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: duration,
        event_category: category
      });
    }
  }
  
  /**
   * Track exceptions
   */
  trackException(error: Error, fatal: boolean = false) {
    this.track('exception', error.name, error.message);
    
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: fatal
      });
    }
  }
  
  /**
   * Get or create user ID
   */
  private getUserId(): string {
    let userId = DataManager.load<string>('analytics_user_id');
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      DataManager.save('analytics_user_id', userId);
    }
    
    return userId;
  }
  
  /**
   * Set up automatic event listeners
   */
  private setupEventListeners() {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button');
        const label = button?.textContent?.trim() || button?.getAttribute('aria-label');
        if (label) {
          this.track('interaction', 'button_click', label);
        }
      }
      
      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        const href = link?.getAttribute('href');
        if (href) {
          this.track('interaction', 'link_click', href);
        }
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      const formName = form.getAttribute('name') || form.getAttribute('id') || 'unknown';
      this.track('interaction', 'form_submit', formName);
    });
    
    // Track errors
    window.addEventListener('error', (e) => {
      this.trackException(new Error(e.message), false);
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackException(new Error(e.reason), false);
    });
  }
  
  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalSessions: number;
    totalPageViews: number;
    totalEvents: number;
    averageSessionDuration: number;
    eventsByCategory: Record<string, number>;
    topPages: Array<{ page: string; views: number }>;
    errorRate: number;
  } {
    const sessions = DataManager.load<UserSession[]>('analytics_sessions', { compress: true }) || [];
    
    if (this.currentSession) {
      sessions.push(this.currentSession);
    }
    
    const summary = {
      totalSessions: sessions.length,
      totalPageViews: sessions.reduce((sum, s) => sum + s.pageViews, 0),
      totalEvents: sessions.reduce((sum, s) => sum + s.events.length, 0),
      averageSessionDuration: 0,
      eventsByCategory: {} as Record<string, number>,
      popularPages: {} as Record<string, number>,
      userId: this.getUserId()
    };
    
    // Calculate average session duration
    const durations = sessions.map(s => {
      const lastEvent = s.events[s.events.length - 1];
      return lastEvent ? lastEvent.timestamp - s.startTime : 0;
    }).filter(d => d > 0);
    
    if (durations.length > 0) {
      summary.averageSessionDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    }
    
    // Count events by category
    sessions.forEach(session => {
      session.events.forEach(event => {
        summary.eventsByCategory[event.category] = 
          (summary.eventsByCategory[event.category] || 0) + 1;
        
        // Count page views
        if (event.category === 'navigation' && event.action === 'page_view' && event.label) {
          summary.popularPages[event.label] = 
            (summary.popularPages[event.label] || 0) + 1;
        }
      });
    });
    
    // Convert popularPages to topPages array
    const topPages = Object.entries(summary.popularPages)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Calculate error rate
    const errorEvents = sessions.reduce((sum, s) => 
      sum + s.events.filter(e => e.category === 'error').length, 0
    );
    const errorRate = summary.totalEvents > 0 
      ? (errorEvents / summary.totalEvents) * 100 
      : 0;
    
    return {
      totalSessions: summary.totalSessions,
      totalPageViews: summary.totalPageViews,
      totalEvents: summary.totalEvents,
      averageSessionDuration: summary.averageSessionDuration,
      eventsByCategory: summary.eventsByCategory,
      topPages,
      errorRate
    };
  }
  
  /**
   * Export analytics data
   */
  exportAnalytics(): string {
    const sessions = DataManager.load<UserSession[]>('analytics_sessions', { compress: true }) || [];
    
    if (this.currentSession) {
      sessions.push(this.currentSession);
    }
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      userId: this.getUserId(),
      sessions,
      summary: this.getAnalyticsSummary()
    }, null, 2);
  }
}

// Global analytics instance
export const analytics = new AnalyticsManager();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackTiming: analytics.trackTiming.bind(analytics),
    trackException: analytics.trackException.bind(analytics),
    getSummary: analytics.getAnalyticsSummary.bind(analytics)
  };
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}