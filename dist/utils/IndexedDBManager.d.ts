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
import { SettingsConfig, AccessibilityIssue, AccessibilityAnalysis, UserPreferences, SystemHealthReport } from '../types/index';
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
export declare class IndexedDBManager {
    private static instance;
    private database;
    private isInitialized;
    private currentSchema;
    private operationCount;
    private totalOperationTime;
    private readonly SCHEMA;
    /**
     * Get singleton instance of IndexedDBManager
     */
    static getInstance(): IndexedDBManager;
    /**
     * Private constructor for singleton pattern
     */
    private constructor(); /**
  
     * Initialize the database with schema setup
     */
    initialize(): Promise<void>;
    /**
     * Open database connection with schema management
     */
    private openDatabase;
    /**
     * Handle database schema upgrades
     */
    private handleSchemaUpgrade;
    /**
     * Verify database schema integrity
     */
    private verifySchema;
    /**
     * Store settings configuration
     */
    storeSettings(settings: SettingsConfig): Promise<void>;
    /**
     * Retrieve settings configuration
     */
    retrieveSettings(): Promise<SettingsConfig | null>;
    /**
       * Store accessibility issue
       */
    storeAccessibilityIssue(issue: AccessibilityIssue): Promise<void>;
    /**
     * Retrieve accessibility issues by criteria
     */
    retrieveAccessibilityIssues(criteria?: {
        pageUrl?: string;
        severity?: string;
        type?: string;
        resolved?: boolean;
        limit?: number;
    }): Promise<AccessibilityIssue[]>;
    /**
     * Store accessibility analysis
     */
    storeAccessibilityAnalysis(analysis: AccessibilityAnalysis): Promise<void>;
    /**
     * Store user preferences
     */
    storeUserPreferences(preferences: UserPreferences, userId?: string): Promise<void>;
    /**
     * Store system health report
     */
    storeSystemHealth(healthReport: SystemHealthReport): Promise<void>; /**
  
     * Create database backup
     */
    createBackup(): Promise<BackupData>;
    /**
     * Restore database from backup
     */
    restoreFromBackup(backupData: BackupData): Promise<void>;
    /**
     * Clean up old data based on retention policies
     */
    cleanupOldData(retentionDays?: number): Promise<void>;
    /**
     * Get database statistics
     */
    getDatabaseStats(): Promise<{
        totalRecords: number;
        storeStats: Record<string, number>;
        databaseSize: number;
        lastCleanup: number;
    }>;
    /**
     * Convert IDB request to Promise
     */
    private promisifyRequest;
    /**
     * Calculate simple checksum for data integrity
     */
    private calculateChecksum;
    /**
     * Record operation performance metrics
     */
    private recordOperation;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        operationCount: number;
        totalOperationTime: number;
        averageOperationTime: number;
    };
    /**
     * Close database connection and cleanup
     */
    close(): Promise<void>;
    /**
     * Delete entire database (for testing/reset)
     */
    deleteDatabase(): Promise<void>;
}
//# sourceMappingURL=IndexedDBManager.d.ts.map