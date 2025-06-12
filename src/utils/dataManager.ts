import { compress, decompress } from 'lz-string';

interface StorageOptions {
  compress?: boolean;
  encrypt?: boolean;
  ttl?: number; // Time to live in milliseconds
}

interface StoredData<T> {
  data: T;
  timestamp: number;
  compressed?: boolean;
  version: string;
}

const STORAGE_VERSION = '1.0';
const STORAGE_PREFIX = 'canvas_';

export class DataManager {
  /**
   * Save data to localStorage with optional compression
   */
  static save<T>(key: string, data: T, options: StorageOptions = {}): boolean {
    try {
      const stored: StoredData<T> = {
        data,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
        compressed: options.compress
      };
      
      let serialized = JSON.stringify(stored);
      
      if (options.compress) {
        serialized = compress(serialized);
      }
      
      localStorage.setItem(STORAGE_PREFIX + key, serialized);
      
      // Set up TTL cleanup if specified
      if (options.ttl) {
        setTimeout(() => {
          this.remove(key);
        }, options.ttl);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      
      // Try to clear old data if storage is full
      if (error instanceof DOMException && error.code === 22) {
        this.cleanup();
        // Retry once
        try {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
          return true;
        } catch {
          return false;
        }
      }
      
      return false;
    }
  }
  
  /**
   * Load data from localStorage
   */
  static load<T>(key: string, options: StorageOptions = {}): T | null {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (!stored) return null;
      
      let parsed: StoredData<T>;
      
      if (options.compress) {
        const decompressed = decompress(stored);
        if (!decompressed) return null;
        parsed = JSON.parse(decompressed);
      } else {
        parsed = JSON.parse(stored);
      }
      
      // Check version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        console.warn(`Data version mismatch for ${key}`);
        this.remove(key);
        return null;
      }
      
      // Check TTL if specified
      if (options.ttl && Date.now() - parsed.timestamp > options.ttl) {
        this.remove(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  }
  
  /**
   * Remove data from localStorage
   */
  static remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }
  
  /**
   * Clear all Canvas data
   */
  static clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  /**
   * Get storage size used by Canvas
   */
  static getStorageSize(): number {
    let size = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          size += item.length;
        }
      }
    });
    
    return size;
  }
  
  /**
   * Clean up old or expired data
   */
  static cleanup(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.timestamp && now - parsed.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// Auto-save form data
export class FormDataManager {
  private static saveTimer: NodeJS.Timeout | null = null;
  
  /**
   * Auto-save form data with debouncing
   */
  static autoSave(formId: string, data: any): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      DataManager.save(`form_${formId}`, data, { 
        compress: false,
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      });
    }, 1000); // 1 second debounce
  }
  
  /**
   * Restore form data
   */
  static restore(formId: string): any {
    return DataManager.load(`form_${formId}`);
  }
  
  /**
   * Clear form data
   */
  static clear(formId: string): void {
    DataManager.remove(`form_${formId}`);
  }
}

// Scan history manager
export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  doctor: string;
  product: string;
  score: number;
  insights: string[];
  researchData?: any;
}

export class ScanHistoryManager {
  private static readonly KEY = 'scan_history';
  private static readonly MAX_ITEMS = 50;
  
  /**
   * Add a scan to history
   */
  static add(scan: Omit<ScanHistoryItem, 'id' | 'timestamp'>): void {
    const history = this.getAll();
    const newItem: ScanHistoryItem = {
      ...scan,
      id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    history.unshift(newItem);
    
    // Keep only the most recent items
    if (history.length > this.MAX_ITEMS) {
      history.splice(this.MAX_ITEMS);
    }
    
    DataManager.save(this.KEY, history, { compress: true });
  }
  
  /**
   * Get all scan history
   */
  static getAll(): ScanHistoryItem[] {
    return DataManager.load<ScanHistoryItem[]>(this.KEY, { compress: true }) || [];
  }
  
  /**
   * Get a specific scan by ID
   */
  static getById(id: string): ScanHistoryItem | null {
    const history = this.getAll();
    return history.find(item => item.id === id) || null;
  }
  
  /**
   * Clear all scan history
   */
  static clear(): void {
    DataManager.remove(this.KEY);
  }
}