/**
 * AccessiAI Storage Manager - Data Persistence System
 * IndexedDB operations with encryption and state synchronization
 * Provides secure data persistence with automatic encryption and caching
 * Supports user preferences, agent states, and accessibility data storage
 */
import type { EncryptedData, UserPreferences } from '../types/index';
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
export declare class StorageManager {
    private dbConnection;
    private encryptionKey;
    private cacheManager;
    private isInitialized;
    private config;
    private storageConfig;
    private static instance;
    static getInstance(): StorageManager;
    private constructor();
    initialize(): Promise<void>;
    store(key: string, data: any): Promise<void>;
    retrieve(key: string): Promise<any>;
    delete(key: string): Promise<void>;
    encrypt(data: any): Promise<EncryptedData>;
    decrypt(encryptedData: EncryptedData): Promise<any>;
    saveSystemState(state: StateSnapshot): Promise<void>;
    loadSystemState(): Promise<StateSnapshot | null>;
    saveUserPreferences(preferences: UserPreferences): Promise<void>;
    loadUserPreferences(): Promise<UserPreferences | null>;
    saveAgentState(agentId: string, state: any): Promise<void>;
    loadAgentState(agentId: string): Promise<any>;
    private openDatabase;
    private createObjectStores;
    private generateEncryptionKey;
    private storeInDB;
    private retrieveFromDB;
    private deleteFromDB;
    private getStoreNameForKey;
    private getKeyPath;
    private isEncryptedData;
    private getStoredEncryptionKey;
    private storeEncryptionKey;
    synchronizeAgentStates(): Promise<void>;
    createStateSnapshot(): Promise<StateSnapshot>;
    restoreFromSnapshot(snapshot: StateSnapshot): Promise<void>;
    private getDefaultUserPreferences;
    getStorageMetrics(): Promise<{
        totalSize: number;
        cacheSize: number;
        dbSize: number;
        encryptionEnabled: boolean;
        isInitialized: boolean;
    }>;
    private calculateTotalStorageSize;
    private calculateDBSize;
    shutdown(): Promise<void>;
}
export declare const storageManager: StorageManager;
export default storageManager;
//# sourceMappingURL=StorageManager.d.ts.map