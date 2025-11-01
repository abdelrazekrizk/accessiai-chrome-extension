/**
 * Production Integration Coordinator - Task 17: Status and Feedback System
 * Central hub for production component integration
 * Following Integration Phase Template System - Phase 2: Interface Design
 */
import type { SystemHealthReport } from '../types/index';
import type { ProductionIntegrationCoordinator, SystemStatusDisplay, UserFeedbackCollector, ProgressIndicatorManager, ProductionSystemEvent, ProgressIndicator, ProgressUpdate, FeedbackSummary, ProductionComponentStatus } from '../types/production';
export declare class ProductionIntegrationCoordinatorImpl implements ProductionIntegrationCoordinator {
    private static instance;
    static getInstance(): ProductionIntegrationCoordinatorImpl;
    private registeredComponents;
    private eventListeners;
    private systemStatusDisplay;
    private userFeedbackCollector;
    private progressIndicatorManager;
    private isInitialized;
    private constructor();
    registerStatusDisplay(display: SystemStatusDisplay): Promise<void>;
    registerFeedbackCollector(collector: UserFeedbackCollector): Promise<void>;
    registerProgressManager(manager: ProgressIndicatorManager): Promise<void>;
    broadcastStatusUpdate(healthReport: SystemHealthReport): Promise<void>;
    broadcastProgressUpdate(progressId: string, update: ProgressUpdate): Promise<void>;
    broadcastSystemEvent(event: ProductionSystemEvent): Promise<void>;
    getSystemStatus(): Promise<SystemHealthReport>;
    getActiveProgress(): Promise<ProgressIndicator[]>;
    getFeedbackSummary(): Promise<FeedbackSummary>;
    addEventListener(eventType: string, listener: Function): string;
    removeEventListener(eventType: string, _subscriptionId: string): void;
    private registerComponent;
    unregisterComponent(id: string): Promise<void>;
    getComponentStatus(id: string): Promise<ProductionComponentStatus | null>;
    getAllComponentStatuses(): Promise<Map<string, ProductionComponentStatus>>;
    private groupFeedbackBy;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private setupDefaultEventListeners;
    getRegisteredComponents(): string[];
    isComponentRegistered(id: string): boolean;
    getEventListenerCount(eventType?: string): number;
}
export declare const productionIntegrationCoordinator: ProductionIntegrationCoordinatorImpl;
export default productionIntegrationCoordinator;
//# sourceMappingURL=ProductionIntegrationCoordinator.d.ts.map