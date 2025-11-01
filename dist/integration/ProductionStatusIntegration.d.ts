/**
 * Production Status Integration - Status and Feedback System
 * Integrates SystemStatusDisplay, UserFeedbackCollector, and ProgressIndicatorManager
 * Following Integration Phase Template System - Phase 4: Progressive Integration
 */
import type { SystemHealthReport } from '../types/index';
export declare class ProductionStatusIntegration {
    private static instance;
    static getInstance(): ProductionStatusIntegration;
    private systemStatusDisplay;
    private userFeedbackCollector;
    private progressIndicatorManager;
    private productionCoordinator;
    private isInitialized;
    private eventListeners;
    private constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private initializeProductionCoordinator;
    private initializeComponents;
    private registerComponents;
    private setupCrossComponentCommunication;
    private setupEventListeners;
    private removeEventListeners;
    private handleStatusChange;
    private handleProgressUpdate;
    private handleFeedbackSubmission;
    updateSystemStatus(healthReport: SystemHealthReport): Promise<void>;
    showFeedbackForm(context?: any): Promise<void>;
    createProgressIndicator(title: string, canCancel?: boolean): Promise<string>;
    getSystemStatus(): Promise<SystemHealthReport>;
    private addEventListener;
    private broadcastIntegrationEvent;
    isIntegrationReady(): boolean;
    getIntegrationStatus(): {
        isInitialized: boolean;
        components: Record<string, string>;
        lastUpdate: number;
    };
    validateIntegration(): Promise<{
        isValid: boolean;
        issues: string[];
    }>;
}
export declare const productionStatusIntegration: ProductionStatusIntegration;
export default productionStatusIntegration;
//# sourceMappingURL=ProductionStatusIntegration.d.ts.map