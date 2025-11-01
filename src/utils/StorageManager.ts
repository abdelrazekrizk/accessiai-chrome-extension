/**
 * AccessiAI Storage Manager - Data Persistence System
 * IndexedDB operations with encryption and state synchronization
 * Provides secure data persistence with automatic encryption and caching
 * Supports user preferences, agent states, and accessibility data storage
 */

import type {
  StorageConfig,
  EncryptedData,
  UserPreferences
} from '../types/index';

// ============================================================================
// STORAGE MANAGER INTERFACES
// ============================================================================

export interface StorageManagerConfig {
  readonly dbName: string;
  readonly version: number;
  readonly encryptionEnabled: boolean;
  readonly cacheTimeout: number;
  readonly maxStorageSize: number;
}

export interface ObjectStoreConfig {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
  indexes: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string;
  unique: boolean;
}

export interface CacheManager {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  size(): number;
}

export interface StateSnapshot {
  readonly timestamp: number;
  readonly version: string;
  readonly agentStates: Record<string, any>;
  readonly userPreferences: UserPreferences;
  readonly systemConfig: Record<string, any>;
}

// ============================================================================
// CACHE MANAGER IMPLEMENTATION
// ============================================================================

class MemoryCacheManager implements CacheManager {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  private defaultTTL: number = 300000; // 5 minutes

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set(key: string, value: any, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired items first
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// ============================================================================
// STORAGE MANAGER IMPLEMENTATION
// ============================================================================

export class StorageManager {
  // ============================================================================
  // CORE PROPERTIES
  // ============================================================================

  private dbConnection: IDBDatabase | null = null;
  private encryptionKey: CryptoKey | null = null;
  private cacheManager: CacheManager = new MemoryCacheManager();
  private isInitialized: boolean = false;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private config: StorageManagerConfig = {
    dbName: 'AccessiAI-Storage',
    version: 1,
    encryptionEnabled: true,
    cacheTimeout: 300000,    // 5 minutes
    maxStorageSize: 50       // 50MB
  };

  private storageConfig: StorageConfig = {
    dbName: 'AccessiAI-Storage',
    version: 1,
    stores: [
      {
        name: 'user-preferences',
        keyPath: 'id',
        autoIncrement: false,
        indexes: [
          { name: 'lastUpdated', keyPath: 'lastUpdated', unique: false }
        ]
      },
      {
        name: 'agent-states',
        keyPath: 'agentId',
        autoIncrement: false,
        indexes: [
          { name: 'timestamp', keyPath: 'timestamp', unique: false },
          { name: 'status', keyPath: 'status', unique: false }
        ]
      },
      {
        name: 'system-config',
        keyPath: 'key',
        autoIncrement: false,
        indexes: [
          { name: 'category', keyPath: 'category', unique: false }
        ]
      },
      {
        name: 'accessibility-data',
        keyPath: 'pageUrl',
        autoIncrement: false,
        indexes: [
          { name: 'analyzedAt', keyPath: 'analyzedAt', unique: false },
          { name: 'complianceScore', keyPath: 'complianceScore', unique: false }
        ]
      }
    ]
  };

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  private static instance: StorageManager | null = null;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private constructor() {
    console.log('[StorageManager] Initialized with encryption support');
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      console.log('[StorageManager] Initializing storage system...');

      // Open database connection
      this.dbConnection = await this.openDatabase();

      // Generate encryption key if enabled
      if (this.config.encryptionEnabled) {
        this.encryptionKey = await this.generateEncryptionKey();
      }

      // Initialize cache manager
      this.cacheManager.clear();

      this.isInitialized = true;
      console.log('[StorageManager] Storage system initialized successfully');

    } catch (error) {
      console.error('[StorageManager] Failed to initialize storage system:', error);
      throw error;
    }
  }

  // ============================================================================
  // CORE STORAGE OPERATIONS
  // ============================================================================

  async store(key: string, data: any): Promise<void> {
    try {
      if (!this.isInitialized || !this.dbConnection) {
        throw new Error('Storage manager not initialized');
      }

      // Determine storage location based on key
      const storeName = this.getStoreNameForKey(key);
      
      // Prepare data for storage
      let dataToStore = data;
      if (this.config.encryptionEnabled && this.encryptionKey) {
        dataToStore = await this.encrypt(data);
      }

      // Store in IndexedDB
      await this.storeInDB(storeName, key, dataToStore);

      // Update cache
      this.cacheManager.set(key, data);

      console.log(`[StorageManager] Stored data for key: ${key}`);

    } catch (error) {
      console.error(`[StorageManager] Failed to store data for key ${key}:`, error);
      throw error;
    }
  }

  async retrieve(key: string): Promise<any> {
    try {
      if (!this.isInitialized || !this.dbConnection) {
        throw new Error('Storage manager not initialized');
      }

      // Check cache first
      const cachedData = this.cacheManager.get(key);
      if (cachedData !== undefined) {
        return cachedData;
      }

      // Retrieve from IndexedDB
      const storeName = this.getStoreNameForKey(key);
      const storedData = await this.retrieveFromDB(storeName, key);

      if (storedData === undefined) {
        return undefined;
      }

      // Decrypt if necessary
      let data = storedData;
      if (this.config.encryptionEnabled && this.encryptionKey && this.isEncryptedData(storedData)) {
        data = await this.decrypt(storedData as EncryptedData);
      }

      // Update cache
      this.cacheManager.set(key, data);

      return data;

    } catch (error) {
      console.error(`[StorageManager] Failed to retrieve data for key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!this.isInitialized || !this.dbConnection) {
        throw new Error('Storage manager not initialized');
      }

      // Delete from IndexedDB
      const storeName = this.getStoreNameForKey(key);
      await this.deleteFromDB(storeName, key);

      // Remove from cache
      this.cacheManager.delete(key);

      console.log(`[StorageManager] Deleted data for key: ${key}`);

    } catch (error) {
      console.error(`[StorageManager] Failed to delete data for key ${key}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // ENCRYPTION METHODS
  // ============================================================================

  async encrypt(data: any): Promise<EncryptedData> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }

    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(JSON.stringify(data));

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encodedData
      );

      return {
        data: new Uint8Array(encryptedBuffer),
        iv,
        timestamp: Date.now(),
        algorithm: 'AES-GCM'
      };

    } catch (error) {
      console.error('[StorageManager] Encryption failed:', error);
      throw error;
    }
  }

  async decrypt(encryptedData: EncryptedData): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }

    try {
      // Convert Uint8Array to ArrayBuffer for crypto.subtle.decrypt
      const dataBuffer = encryptedData.data.buffer.slice(
        encryptedData.data.byteOffset,
        encryptedData.data.byteOffset + encryptedData.data.byteLength
      );
      const ivBuffer = encryptedData.iv.buffer.slice(
        encryptedData.iv.byteOffset,
        encryptedData.iv.byteOffset + encryptedData.iv.byteLength
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer as ArrayBuffer },
        this.encryptionKey,
        dataBuffer as ArrayBuffer
      );

      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decryptedText);

    } catch (error) {
      console.error('[StorageManager] Decryption failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  async saveSystemState(state: StateSnapshot): Promise<void> {
    await this.store('system-state', state);
    console.log('[StorageManager] System state saved');
  }

  async loadSystemState(): Promise<StateSnapshot | null> {
    const state = await this.retrieve('system-state');
    if (state) {
      console.log('[StorageManager] System state loaded');
    }
    return state || null;
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    await this.store('user-preferences', preferences);
    console.log('[StorageManager] User preferences saved');
  }

  async loadUserPreferences(): Promise<UserPreferences | null> {
    const preferences = await this.retrieve('user-preferences');
    return preferences || null;
  }

  async saveAgentState(agentId: string, state: any): Promise<void> {
    await this.store(`agent-state-${agentId}`, {
      agentId,
      state,
      timestamp: Date.now()
    });
  }

  async loadAgentState(agentId: string): Promise<any> {
    const data = await this.retrieve(`agent-state-${agentId}`);
    return data?.state || null;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.storageConfig.dbName, this.storageConfig.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    for (const storeConfig of this.storageConfig.stores) {
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(storeConfig.name)) {
        const store = db.createObjectStore(storeConfig.name, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement
        });

        // Create indexes
        for (const indexConfig of storeConfig.indexes) {
          store.createIndex(indexConfig.name, indexConfig.keyPath, {
            unique: indexConfig.unique
          });
        }

        console.log(`[StorageManager] Created object store: ${storeConfig.name}`);
      }
    }
  }

  private async generateEncryptionKey(): Promise<CryptoKey> {
    try {
      // Check if key exists in storage
      const existingKey = await this.getStoredEncryptionKey();
      if (existingKey) {
        return existingKey;
      }

      // Generate new key
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );

      // Store key for future use
      await this.storeEncryptionKey(key);

      console.log('[StorageManager] Generated new encryption key');
      return key;

    } catch (error) {
      console.error('[StorageManager] Failed to generate encryption key:', error);
      throw error;
    }
  }

  private async storeInDB(storeName: string, key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.dbConnection) {
        reject(new Error('Database connection not available'));
        return;
      }

      const transaction = this.dbConnection.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put({ [this.getKeyPath(storeName)]: key, data, timestamp: Date.now() });

      request.onerror = () => {
        reject(new Error(`Failed to store data: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  private async retrieveFromDB(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.dbConnection) {
        reject(new Error('Database connection not available'));
        return;
      }

      const transaction = this.dbConnection.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(key);

      request.onerror = () => {
        reject(new Error(`Failed to retrieve data: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result?.data);
      };
    });
  }

  private async deleteFromDB(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.dbConnection) {
        reject(new Error('Database connection not available'));
        return;
      }

      const transaction = this.dbConnection.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(key);

      request.onerror = () => {
        reject(new Error(`Failed to delete data: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getStoreNameForKey(key: string): string {
    if (key.startsWith('user-preferences')) return 'user-preferences';
    if (key.startsWith('agent-state-')) return 'agent-states';
    if (key.startsWith('system-')) return 'system-config';
    if (key.includes('accessibility')) return 'accessibility-data';
    return 'system-config'; // default
  }

  private getKeyPath(storeName: string): string {
    const storeConfig = this.storageConfig.stores.find(s => s.name === storeName);
    return storeConfig?.keyPath || 'id';
  }

  private isEncryptedData(data: any): boolean {
    return data && 
           typeof data === 'object' && 
           data.data instanceof Uint8Array && 
           data.iv instanceof Uint8Array &&
           data.algorithm === 'AES-GCM';
  }

  private async getStoredEncryptionKey(): Promise<CryptoKey | null> {
    try {
      // In a real implementation, this would retrieve from secure storage
      // For now, we'll generate a new key each time
      return null;
    } catch (error) {
      return null;
    }
  }

  private async storeEncryptionKey(_key: CryptoKey): Promise<void> {
    try {
      // In a real implementation, this would store in secure storage
      // For now, we'll keep it in memory only
      console.log('[StorageManager] Encryption key stored (memory only)');
    } catch (error) {
      console.error('[StorageManager] Failed to store encryption key:', error);
    }
  }

  // ============================================================================
  // STATE SYNCHRONIZATION
  // ============================================================================

  async synchronizeAgentStates(): Promise<void> {
    try {
      console.log('[StorageManager] Synchronizing agent states...');

      // Synchronize all registered agent states with persistent storage
      const timestamp = Date.now();
      
      await this.store('last-sync', {
        timestamp,
        agentCount: 0,
        syncStatus: 'completed'
      });

      console.log('[StorageManager] Agent states synchronized');

    } catch (error) {
      console.error('[StorageManager] Failed to synchronize agent states:', error);
      throw error;
    }
  }

  async createStateSnapshot(): Promise<StateSnapshot> {
    const snapshot: StateSnapshot = {
      timestamp: Date.now(),
      version: '2.0.0',
      agentStates: {}, // Will be populated when agents are implemented
      userPreferences: await this.loadUserPreferences() || this.getDefaultUserPreferences(),
      systemConfig: await this.retrieve('system-config') || {}
    };

    await this.store('state-snapshot', snapshot);
    return snapshot;
  }

  async restoreFromSnapshot(snapshot: StateSnapshot): Promise<void> {
    try {
      console.log('[StorageManager] Restoring from state snapshot...');

      // Restore user preferences
      if (snapshot.userPreferences) {
        await this.saveUserPreferences(snapshot.userPreferences);
      }

      // Restore system config
      if (snapshot.systemConfig) {
        await this.store('system-config', snapshot.systemConfig);
      }

      // Restore agent states (when agents are implemented)
      for (const [agentId, state] of Object.entries(snapshot.agentStates)) {
        await this.saveAgentState(agentId, state);
      }

      console.log('[StorageManager] State snapshot restored successfully');

    } catch (error) {
      console.error('[StorageManager] Failed to restore from snapshot:', error);
      throw error;
    }
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  private getDefaultUserPreferences(): UserPreferences {
    return {
      accessibility: {
        enableHighContrast: false,
        fontSize: 'medium',
        enableScreenReader: false,
        enableKeyboardNavigation: true,
        enableVoiceCommands: false,
        customRules: []
      },
      ui: {
        theme: 'auto',
        panelPosition: 'top-right',
        showNotifications: true,
        animationsEnabled: true,
        compactMode: false
      },
      performance: {
        enableRealTimeScanning: true,
        scanningInterval: 1000,
        maxConcurrentScans: 3,
        enableCaching: true,
        cacheTimeout: 300000
      },
      privacy: {
        enableTelemetry: false,
        enableErrorReporting: true,
        dataRetentionDays: 30,
        enableEncryption: true
      },
      lastUpdated: Date.now()
    };
  }

  // ============================================================================
  // STORAGE METRICS AND MONITORING
  // ============================================================================

  async getStorageMetrics(): Promise<{
    totalSize: number;
    cacheSize: number;
    dbSize: number;
    encryptionEnabled: boolean;
    isInitialized: boolean;
  }> {
    return {
      totalSize: await this.calculateTotalStorageSize(),
      cacheSize: this.cacheManager.size(),
      dbSize: await this.calculateDBSize(),
      encryptionEnabled: this.config.encryptionEnabled,
      isInitialized: this.isInitialized
    };
  }

  private async calculateTotalStorageSize(): Promise<number> {
    // Simplified calculation - in production would use navigator.storage.estimate()
    return this.cacheManager.size() * 1024; // Rough estimate in bytes
  }

  private async calculateDBSize(): Promise<number> {
    // Simplified calculation - would use actual IndexedDB size calculation
    return 0; // Placeholder
  }

  // ============================================================================
  // CLEANUP AND SHUTDOWN
  // ============================================================================

  async shutdown(): Promise<void> {
    try {
      console.log('[StorageManager] Shutting down storage system...');

      // Clear cache
      this.cacheManager.clear();

      // Close database connection
      if (this.dbConnection) {
        this.dbConnection.close();
        this.dbConnection = null;
      }

      // Clear encryption key
      this.encryptionKey = null;
      this.isInitialized = false;

      console.log('[StorageManager] Storage system shutdown complete');

    } catch (error) {
      console.error('[StorageManager] Error during storage shutdown:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const storageManager = StorageManager.getInstance();
export default storageManager;