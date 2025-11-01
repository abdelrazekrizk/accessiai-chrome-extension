/**
 * IndexedDBManager.ts
 * 
 * IndexedDB Schema Design and Management for AccessiAI Chrome Extension
 * Implements comprehensive database schema including:
 * - Database schema for user preferences and accessibility data
 * - Data migration system for schema updates
 * - Backup and restore functionality with data validation
 * 
 * Performance Target: <100ms database operations
 * Storage: Efficient schema design with proper indexing
 * 
 * @version 2.0.0
 * @author AccessiAI Team
 */

import { 
  SettingsConfig,
  AccessibilityIssue,
  AccessibilityAnalysis,
  UserPreferences,
  SystemHealthReport
} from '../types/index';

/**
 * Database schema configuration
 */
export interface DatabaseSchema {
  readonly name: string;
  readonly version: number;
  readonly stores: readonly ObjectStoreSchema[];
}

/**
 * Object store schema configuration
 */
export interface ObjectStoreSchema {
  readonly name: string;
  readonly keyPath: string;
  readonly autoIncrement: boolean;
  readonly indexes: readonly IndexSchema[];
}

/**
 * Index schema configuration
 */
export interface IndexSchema {
  readonly name: string;
  readonly keyPath: string | readonly string[];
  readonly unique: boolean;
  readonly multiEntry?: boolean;
}

/**
 * Database migration configuration
 */
export interface MigrationConfig {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly migrationSteps: readonly MigrationStep[];
}

/**
 * Individual migration step
 */
export interface MigrationStep {
  readonly type: 'create-store' | 'delete-store' | 'create-index' | 'delete-index' | 'transform-data';
  readonly storeName: string;
  readonly indexName?: string;
  readonly keyPath?: string | readonly string[];
  readonly options?: any;
  readonly transformer?: (data: any) => any;
}

/**
 * Backup data structure
 */
export interface BackupData {
  readonly version: number;
  readonly timestamp: number;
  readonly stores: Record<string, any[]>;
  readonly metadata: BackupMetadata;
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  readonly extensionVersion: string;
  readonly schemaVersion: number;
  readonly recordCount: number;
  readonly dataSize: number;
  readonly checksum: string;
}

/**
 * IndexedDBManager - Comprehensive database schema management
 * 
 * Provides database schema design, migration system, and backup/restore
 * functionality for the AccessiAI Chrome Extension.
 */
export class IndexedDBManager {
  private static instance: IndexedDBManager;
  
  // Core Properties
  private database: IDBDatabase | null = null;
  private isInitialized: boolean = false;
  private currentSchema: DatabaseSchema;
  
  // Performance Tracking
  private operationCount: number = 0;
  private totalOperationTime: number = 0;
  
  // Database Schema Definition
  private readonly SCHEMA: DatabaseSchema = {
    name: 'AccessiAIDB',
    version: 1,
    stores: [
      {
        name: 'settings',
        keyPath: 'id',
        autoIncrement: false,
        indexes: [
          { name: 'lastUpdated', keyPath: 'lastUpdated', unique: false },
          { name: 'category', keyPath: 'category', unique: false }
        ]
      },
      {
        name: 'accessibility-issues',
        keyPath: 'id',
        autoIncrement: false,
        indexes: [
          { name: 'severity', keyPath: 'severity', unique: false },
          { name: 'type', keyPath: 'type', unique: false },
          { name: 'detectedAt', keyPath: 'detectedAt', unique: false },
          { name: 'pageUrl', keyPath: 'pageUrl', unique: false },
          { name: 'resolved', keyPath: 'resolved', unique: false }
        ]
      },
      {
        name: 'accessibility-analyses',
        keyPath: 'id',
        autoIncrement: false,
        indexes: [
          { name: 'pageUrl', keyPath: 'pageUrl', unique: false },
          { name: 'analyzedAt', keyPath: 'analyzedAt', unique: false },
          { name: 'complianceScore', keyPath: 'complianceScore', unique: false }
        ]
      },
      {
        name: 'user-preferences',
        keyPath: 'userId',
        autoIncrement: false,
        indexes: [
          { name: 'lastUpdated', keyPath: 'lastUpdated', unique: false },
          { name: 'profileType', keyPath: 'accessibility.profile.id', unique: false }
        ]
      },
      {
        name: 'system-health',
        keyPath: 'timestamp',
        autoIncrement: false,
        indexes: [
          { name: 'overallStatus', keyPath: 'overallStatus', unique: false },
          { name: 'timestamp', keyPath: 'timestamp', unique: false }
        ]
      },
      {
        name: 'cache-entries',
        keyPath: 'key',
        autoIncrement: false,
        indexes: [
          { name: 'expiresAt', keyPath: 'expiresAt', unique: false },
          { name: 'category', keyPath: 'category', unique: false },
          { name: 'createdAt', keyPath: 'createdAt', unique: false }
        ]
      }
    ]
  };

  /**
   * Get singleton instance of IndexedDBManager
   */
  static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    console.log('[IndexedDBManager] Initializing IndexedDB Schema Management System...');
    this.currentSchema = this.SCHEMA;
  }  /**

   * Initialize the database with schema setup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[IndexedDBManager] Already initialized, skipping...');
      return;
    }

    const startTime = performance.now();
    
    try {
      console.log('[IndexedDBManager] Starting database initialization...');
      
      // Open database with current schema
      this.database = await this.openDatabase();
      
      // Verify schema integrity
      await this.verifySchema();
      
      this.isInitialized = true;
      const initTime = performance.now() - startTime;
      
      console.log(`[IndexedDBManager] Database initialized in ${initTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[IndexedDBManager] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Open database connection with schema management
   */
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      console.log(`[IndexedDBManager] Opening database: ${this.currentSchema.name} v${this.currentSchema.version}`);
      
      const request = indexedDB.open(this.currentSchema.name, this.currentSchema.version);
      
      request.onerror = () => {
        console.error('[IndexedDBManager] Database open failed:', request.error);
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };
      
      request.onsuccess = () => {
        console.log('[IndexedDBManager] Database opened successfully');
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('[IndexedDBManager] Database upgrade needed');
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        
        this.handleSchemaUpgrade(db, transaction, event.oldVersion, event.newVersion || 0);
      };
    });
  }

  /**
   * Handle database schema upgrades
   */
  private handleSchemaUpgrade(db: IDBDatabase, _transaction: IDBTransaction, oldVersion: number, newVersion: number): void {
    console.log(`[IndexedDBManager] Upgrading schema from v${oldVersion} to v${newVersion}`);
    
    try {
      // Create object stores based on schema
      for (const storeSchema of this.currentSchema.stores) {
        if (!db.objectStoreNames.contains(storeSchema.name)) {
          console.log(`[IndexedDBManager] Creating object store: ${storeSchema.name}`);
          
          const store = db.createObjectStore(storeSchema.name, {
            keyPath: storeSchema.keyPath,
            autoIncrement: storeSchema.autoIncrement
          });
          
          // Create indexes
          for (const indexSchema of storeSchema.indexes) {
            console.log(`[IndexedDBManager] Creating index: ${indexSchema.name} on ${storeSchema.name}`);
            store.createIndex(indexSchema.name, indexSchema.keyPath, {
              unique: indexSchema.unique,
              multiEntry: indexSchema.multiEntry || false
            });
          }
        }
      }
      
      console.log('[IndexedDBManager] Schema upgrade completed successfully');
    } catch (error) {
      console.error('[IndexedDBManager] Schema upgrade failed:', error);
      throw error;
    }
  }

  /**
   * Verify database schema integrity
   */
  private async verifySchema(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    console.log('[IndexedDBManager] Verifying schema integrity...');
    
    // Verify object stores
    for (const storeSchema of this.currentSchema.stores) {
      if (!this.database.objectStoreNames.contains(storeSchema.name)) {
        throw new Error(`Missing object store: ${storeSchema.name}`);
      }
    }
    
    console.log('[IndexedDBManager] Schema verification completed');
  }

  /**
   * Store settings configuration
   */
  async storeSettings(settings: SettingsConfig): Promise<void> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const store = this.database!.transaction(['settings'], 'readwrite').objectStore('settings');
      
      const settingsRecord = {
        id: 'main-settings',
        category: 'settings',
        data: settings,
        lastUpdated: Date.now()
      };
      
      await this.promisifyRequest(store.put(settingsRecord));
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Settings stored in ${operationTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[IndexedDBManager] Failed to store settings:', error);
      throw error;
    }
  }

  /**
   * Retrieve settings configuration
   */
  async retrieveSettings(): Promise<SettingsConfig | null> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const store = this.database!.transaction(['settings'], 'readonly').objectStore('settings');
      
      const result = await this.promisifyRequest(store.get('main-settings'));
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Settings retrieved in ${operationTime.toFixed(2)}ms`);
      
      return result ? result.data : null;
    } catch (error) {
      console.error('[IndexedDBManager] Failed to retrieve settings:', error);
      throw error;
    }
  }  
/**
   * Store accessibility issue
   */
  async storeAccessibilityIssue(issue: AccessibilityIssue): Promise<void> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const transaction = this.database!.transaction(['accessibility-issues'], 'readwrite');
      const store = transaction.objectStore('accessibility-issues');
      
      const issueRecord = {
        ...issue,
        pageUrl: window.location.href,
        resolved: false,
        storedAt: Date.now()
      };
      
      await this.promisifyRequest(store.put(issueRecord));
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Accessibility issue stored in ${operationTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[IndexedDBManager] Failed to store accessibility issue:', error);
      throw error;
    }
  }

  /**
   * Retrieve accessibility issues by criteria
   */
  async retrieveAccessibilityIssues(criteria?: {
    pageUrl?: string;
    severity?: string;
    type?: string;
    resolved?: boolean;
    limit?: number;
  }): Promise<AccessibilityIssue[]> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const transaction = this.database!.transaction(['accessibility-issues'], 'readonly');
      const store = transaction.objectStore('accessibility-issues');
      
      let request: IDBRequest;
      
      if (criteria?.pageUrl) {
        const index = store.index('pageUrl');
        request = index.getAll(criteria.pageUrl);
      } else if (criteria?.severity) {
        const index = store.index('severity');
        request = index.getAll(criteria.severity);
      } else {
        request = store.getAll();
      }
      
      const results = await this.promisifyRequest(request);
      
      // Apply additional filtering
      let filteredResults = results;
      if (criteria?.type) {
        filteredResults = filteredResults.filter((issue: any) => issue.type === criteria.type);
      }
      if (criteria?.resolved !== undefined) {
        filteredResults = filteredResults.filter((issue: any) => issue.resolved === criteria.resolved);
      }
      if (criteria?.limit) {
        filteredResults = filteredResults.slice(0, criteria.limit);
      }
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Retrieved ${filteredResults.length} accessibility issues in ${operationTime.toFixed(2)}ms`);
      
      return filteredResults;
    } catch (error) {
      console.error('[IndexedDBManager] Failed to retrieve accessibility issues:', error);
      throw error;
    }
  }

  /**
   * Store accessibility analysis
   */
  async storeAccessibilityAnalysis(analysis: AccessibilityAnalysis): Promise<void> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const transaction = this.database!.transaction(['accessibility-analyses'], 'readwrite');
      const store = transaction.objectStore('accessibility-analyses');
      
      const analysisRecord = {
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...analysis,
        storedAt: Date.now()
      };
      
      await this.promisifyRequest(store.put(analysisRecord));
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Accessibility analysis stored in ${operationTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[IndexedDBManager] Failed to store accessibility analysis:', error);
      throw error;
    }
  }

  /**
   * Store user preferences
   */
  async storeUserPreferences(preferences: UserPreferences, userId: string = 'default'): Promise<void> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const transaction = this.database!.transaction(['user-preferences'], 'readwrite');
      const store = transaction.objectStore('user-preferences');
      
      const preferencesRecord = {
        userId,
        ...preferences,
        storedAt: Date.now()
      };
      
      await this.promisifyRequest(store.put(preferencesRecord));
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] User preferences stored in ${operationTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[IndexedDBManager] Failed to store user preferences:', error);
      throw error;
    }
  }

  /**
   * Store system health report
   */
  async storeSystemHealth(healthReport: SystemHealthReport): Promise<void> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const transaction = this.database!.transaction(['system-health'], 'readwrite');
      const store = transaction.objectStore('system-health');
      
      await this.promisifyRequest(store.put(healthReport));
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] System health report stored in ${operationTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[IndexedDBManager] Failed to store system health report:', error);
      throw error;
    }
  }  /**

   * Create database backup
   */
  async createBackup(): Promise<BackupData> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      console.log('[IndexedDBManager] Creating database backup...');
      
      const stores: Record<string, any[]> = {};
      let totalRecords = 0;
      
      // Backup each object store
      for (const storeSchema of this.currentSchema.stores) {
        const transaction = this.database!.transaction([storeSchema.name], 'readonly');
        const store = transaction.objectStore(storeSchema.name);
        
        const data = await this.promisifyRequest(store.getAll());
        stores[storeSchema.name] = data;
        totalRecords += data.length;
        
        console.log(`[IndexedDBManager] Backed up ${data.length} records from ${storeSchema.name}`);
      }
      
      const backupData: BackupData = {
        version: this.currentSchema.version,
        timestamp: Date.now(),
        stores,
        metadata: {
          extensionVersion: '2.0.0',
          schemaVersion: this.currentSchema.version,
          recordCount: totalRecords,
          dataSize: JSON.stringify(stores).length,
          checksum: this.calculateChecksum(JSON.stringify(stores))
        }
      };
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Backup created in ${operationTime.toFixed(2)}ms (${totalRecords} records)`);
      
      return backupData;
    } catch (error) {
      console.error('[IndexedDBManager] Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupData: BackupData): Promise<void> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      console.log('[IndexedDBManager] Restoring database from backup...');
      
      // Validate backup integrity
      const calculatedChecksum = this.calculateChecksum(JSON.stringify(backupData.stores));
      if (calculatedChecksum !== backupData.metadata.checksum) {
        throw new Error('Backup data integrity check failed');
      }
      
      // Clear existing data and restore
      for (const [storeName, storeData] of Object.entries(backupData.stores)) {
        if (this.database!.objectStoreNames.contains(storeName)) {
          const transaction = this.database!.transaction([storeName], 'readwrite');
          const store = transaction.objectStore('storeName');
          
          // Clear existing data
          await this.promisifyRequest(store.clear());
          
          // Restore data
          for (const record of storeData) {
            await this.promisifyRequest(store.put(record));
          }
          
          console.log(`[IndexedDBManager] Restored ${storeData.length} records to ${storeName}`);
        }
      }
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Database restored in ${operationTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[IndexedDBManager] Failed to restore from backup:', error);
      throw error;
    }
  }

  /**
   * Clean up old data based on retention policies
   */
  async cleanupOldData(retentionDays: number = 30): Promise<void> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      console.log(`[IndexedDBManager] Cleaning up data older than ${retentionDays} days...`);
      
      const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
      let totalDeleted = 0;
      
      // Clean up accessibility issues
      const issuesTransaction = this.database!.transaction(['accessibility-issues'], 'readwrite');
      const issuesStore = issuesTransaction.objectStore('accessibility-issues');
      const issuesIndex = issuesStore.index('detectedAt');
      
      const oldIssues = await this.promisifyRequest(
        issuesIndex.getAll(IDBKeyRange.upperBound(cutoffTime))
      );
      
      for (const issue of oldIssues) {
        await this.promisifyRequest(issuesStore.delete(issue.id));
        totalDeleted++;
      }
      
      // Clean up system health reports
      const healthTransaction = this.database!.transaction(['system-health'], 'readwrite');
      const healthStore = healthTransaction.objectStore('system-health');
      
      const oldHealthReports = await this.promisifyRequest(
        healthStore.getAll(IDBKeyRange.upperBound(cutoffTime))
      );
      
      for (const report of oldHealthReports) {
        await this.promisifyRequest(healthStore.delete(report.timestamp));
        totalDeleted++;
      }
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      console.log(`[IndexedDBManager] Cleanup completed in ${operationTime.toFixed(2)}ms (${totalDeleted} records deleted)`);
    } catch (error) {
      console.error('[IndexedDBManager] Failed to cleanup old data:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalRecords: number;
    storeStats: Record<string, number>;
    databaseSize: number;
    lastCleanup: number;
  }> {
    const startTime = performance.now();
    
    try {
      if (!this.database) {
        await this.initialize();
      }
      
      const storeStats: Record<string, number> = {};
      let totalRecords = 0;
      
      for (const storeSchema of this.currentSchema.stores) {
        const transaction = this.database!.transaction([storeSchema.name], 'readonly');
        const store = transaction.objectStore(storeSchema.name);
        
        const count = await this.promisifyRequest(store.count());
        storeStats[storeSchema.name] = count;
        totalRecords += count;
      }
      
      const operationTime = performance.now() - startTime;
      this.recordOperation(operationTime);
      
      return {
        totalRecords,
        storeStats,
        databaseSize: 0, // Would need to estimate based on data
        lastCleanup: Date.now()
      };
    } catch (error) {
      console.error('[IndexedDBManager] Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Convert IDB request to Promise
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Calculate simple checksum for data integrity
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Record operation performance metrics
   */
  private recordOperation(operationTime: number): void {
    this.operationCount++;
    this.totalOperationTime += operationTime;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    operationCount: number;
    totalOperationTime: number;
    averageOperationTime: number;
  } {
    return {
      operationCount: this.operationCount,
      totalOperationTime: this.totalOperationTime,
      averageOperationTime: this.operationCount > 0 ? this.totalOperationTime / this.operationCount : 0
    };
  }

  /**
   * Close database connection and cleanup
   */
  async close(): Promise<void> {
    if (this.database) {
      console.log('[IndexedDBManager] Closing database connection...');
      this.database.close();
      this.database = null;
      this.isInitialized = false;
    }
  }

  /**
   * Delete entire database (for testing/reset)
   */
  async deleteDatabase(): Promise<void> {
    if (this.database) {
      await this.close();
    }
    
    return new Promise((resolve, reject) => {
      console.log('[IndexedDBManager] Deleting database...');
      const deleteRequest = indexedDB.deleteDatabase(this.currentSchema.name);
      
      deleteRequest.onsuccess = () => {
        console.log('[IndexedDBManager] Database deleted successfully');
        resolve();
      };
      
      deleteRequest.onerror = () => {
        console.error('[IndexedDBManager] Failed to delete database:', deleteRequest.error);
        reject(deleteRequest.error);
      };
    });
  }
}