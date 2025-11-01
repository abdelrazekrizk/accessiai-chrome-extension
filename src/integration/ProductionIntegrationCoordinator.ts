/**
 * Production Integration Coordinator - Task 17: Status and Feedback System
 * Central hub for production component integration
 * Following Integration Phase Template System - Phase 2: Interface Design
 */

import type {
  SystemHealthReport,
  SystemStatus
} from '../types/index';

import type {
  ProductionIntegrationCoordinator,
  SystemStatusDisplay,
  UserFeedbackCollector,
  ProgressIndicatorManager,
  ProductionSystemEvent,
  ProgressIndicator,
  ProgressUpdate,
  FeedbackSummary,
  ProductionComponentLifecycle,
  ProductionComponentStatus
} from '../types/production';

// ============================================================================
// PRODUCTION INTEGRATION COORDINATOR IMPLEMENTATION
// ============================================================================

export class ProductionIntegrationCoordinatorImpl implements ProductionIntegrationCoordinator {
  // ============================================================================
  // SINGLETON PATTERN (Following AccessiAI Roadmap)
  // ============================================================================

  private static instance: ProductionIntegrationCoordinatorImpl;
  
  static getInstance(): ProductionIntegrationCoordinatorImpl {
    if (!ProductionIntegrationCoordinatorImpl.instance) {
      ProductionIntegrationCoordinatorImpl.instance = new ProductionIntegrationCoordinatorImpl();
    }
    return ProductionIntegrationCoordinatorImpl.instance;
  }

  // ============================================================================
  // CORE PROPERTIES (Following Roadmap Variable Naming)
  // ============================================================================

  private registeredComponents: Map<string, ProductionComponentLifecycle> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private systemStatusDisplay: SystemStatusDisplay | null = null;
  private userFeedbackCollector: UserFeedbackCollector | null = null;
  private progressIndicatorManager: ProgressIndicatorManager | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    console.log('[ProductionIntegrationCoordinator] Initialized for Task 17 components');
  }

  // ============================================================================
  // COMPONENT REGISTRATION (Following Template Phase 2)
  // ============================================================================

  async registerStatusDisplay(display: SystemStatusDisplay): Promise<void> {
    try {
      console.log('[ProductionIntegrationCoordinator] Registering SystemStatusDisplay...');
      
      this.systemStatusDisplay = display;
      await this.registerComponent('system-status-display', display as unknown as ProductionComponentLifecycle);
      
      console.log('[ProductionIntegrationCoordinator] SystemStatusDisplay registered successfully');
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to register SystemStatusDisplay:', error);
      throw error;
    }
  }

  async registerFeedbackCollector(collector: UserFeedbackCollector): Promise<void> {
    try {
      console.log('[ProductionIntegrationCoordinator] Registering UserFeedbackCollector...');
      
      this.userFeedbackCollector = collector;
      await this.registerComponent('user-feedback-collector', collector as unknown as ProductionComponentLifecycle);
      
      console.log('[ProductionIntegrationCoordinator] UserFeedbackCollector registered successfully');
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to register UserFeedbackCollector:', error);
      throw error;
    }
  }

  async registerProgressManager(manager: ProgressIndicatorManager): Promise<void> {
    try {
      console.log('[ProductionIntegrationCoordinator] Registering ProgressIndicatorManager...');
      
      this.progressIndicatorManager = manager;
      await this.registerComponent('progress-indicator-manager', manager as unknown as ProductionComponentLifecycle);
      
      console.log('[ProductionIntegrationCoordinator] ProgressIndicatorManager registered successfully');
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to register ProgressIndicatorManager:', error);
      throw error;
    }
  }

  // ============================================================================
  // EVENT BROADCASTING (Following Event-Driven Architecture)
  // ============================================================================

  async broadcastStatusUpdate(healthReport: SystemHealthReport): Promise<void> {
    try {
      console.log('[ProductionIntegrationCoordinator] Broadcasting status update...');
      
      // Update system status display
      if (this.systemStatusDisplay) {
        await this.systemStatusDisplay.updateStatus(healthReport);
      }
      
      // Broadcast to all listeners
      const event: ProductionSystemEvent = {
        type: 'status-changed',
        source: 'production-coordinator',
        data: healthReport,
        timestamp: Date.now()
      };
      
      await this.broadcastSystemEvent(event);
      
      console.log(`[ProductionIntegrationCoordinator] Status update broadcasted - Status: ${healthReport.overallStatus}`);
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to broadcast status update:', error);
      throw error;
    }
  }

  async broadcastProgressUpdate(progressId: string, update: ProgressUpdate): Promise<void> {
    try {
      console.log(`[ProductionIntegrationCoordinator] Broadcasting progress update for: ${progressId}`);
      
      // Update progress manager
      if (this.progressIndicatorManager) {
        await this.progressIndicatorManager.updateProgress(progressId, update);
      }
      
      // Broadcast to all listeners
      const event: ProductionSystemEvent = {
        type: 'progress-updated',
        source: 'production-coordinator',
        data: { progressId, update },
        timestamp: Date.now(),
        correlationId: progressId
      };
      
      await this.broadcastSystemEvent(event);
      
      console.log(`[ProductionIntegrationCoordinator] Progress update broadcasted for: ${progressId}`);
      
    } catch (error) {
      console.error(`[ProductionIntegrationCoordinator] Failed to broadcast progress update for ${progressId}:`, error);
      throw error;
    }
  }

  async broadcastSystemEvent(event: ProductionSystemEvent): Promise<void> {
    try {
      const listeners = this.eventListeners.get(event.type) || [];
      
      // Execute all listeners for this event type
      const promises = listeners.map(listener => {
        try {
          return Promise.resolve(listener(event));
        } catch (error) {
          console.error(`[ProductionIntegrationCoordinator] Event listener error for ${event.type}:`, error);
          return Promise.resolve();
        }
      });
      
      await Promise.allSettled(promises);
      
      console.log(`[ProductionIntegrationCoordinator] System event broadcasted: ${event.type}`);
      
    } catch (error) {
      console.error(`[ProductionIntegrationCoordinator] Failed to broadcast system event ${event.type}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // SYSTEM STATUS QUERIES (Following Template Interface Design)
  // ============================================================================

  async getSystemStatus(): Promise<SystemHealthReport> {
    try {
      // This would integrate with existing PerformanceMonitor
      // For now, return a placeholder that will be replaced during integration
      const placeholderHealthReport: SystemHealthReport = {
        timestamp: Date.now(),
        overallStatus: 'healthy' as SystemStatus,
        agents: [],
        performance: {
          averageResponseTime: 0,
          totalThroughput: 0,
          systemErrorRate: 0,
          uptime: 0
        },
        resources: {
          memoryUsage: 0,
          cpuUsage: 0,
          storageUsage: 0,
          networkUsage: 0
        },
        errors: []
      };
      
      console.log('[ProductionIntegrationCoordinator] System status retrieved');
      return placeholderHealthReport;
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to get system status:', error);
      throw error;
    }
  }

  async getActiveProgress(): Promise<ProgressIndicator[]> {
    try {
      if (!this.progressIndicatorManager) {
        return [];
      }
      
      const activeProgress = await this.progressIndicatorManager.getActiveProgress();
      console.log(`[ProductionIntegrationCoordinator] Retrieved ${activeProgress.length} active progress indicators`);
      
      return activeProgress;
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to get active progress:', error);
      throw error;
    }
  }

  async getFeedbackSummary(): Promise<FeedbackSummary> {
    try {
      if (!this.userFeedbackCollector) {
        return {
          totalFeedback: 0,
          feedbackByType: {} as any,
          feedbackByCategory: {} as any,
          feedbackBySeverity: {} as any
        };
      }
      
      const feedbackHistory = await this.userFeedbackCollector.getFeedbackHistory();
      
      // Calculate summary statistics
      const lastFeedbackDate = feedbackHistory.length > 0 ? 
        Math.max(...feedbackHistory.map(f => f.timestamp)) : undefined;
      
      const summary: FeedbackSummary = {
        totalFeedback: feedbackHistory.length,
        feedbackByType: this.groupFeedbackBy(feedbackHistory, 'type'),
        feedbackByCategory: this.groupFeedbackBy(feedbackHistory, 'category'),
        feedbackBySeverity: this.groupFeedbackBy(feedbackHistory, 'severity'),
        ...(lastFeedbackDate !== undefined && { lastFeedbackDate })
      };
      
      console.log(`[ProductionIntegrationCoordinator] Feedback summary generated - Total: ${summary.totalFeedback}`);
      return summary;
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to get feedback summary:', error);
      throw error;
    }
  }

  // ============================================================================
  // EVENT LISTENER MANAGEMENT (Following Event-Driven Pattern)
  // ============================================================================

  addEventListener(eventType: string, listener: Function): string {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(listener);
    
    console.log(`[ProductionIntegrationCoordinator] Event listener added for: ${eventType}`);
    return subscriptionId;
  }

  removeEventListener(eventType: string, _subscriptionId: string): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      // In a real implementation, we'd track subscription IDs
      // For now, just log the removal
      console.log(`[ProductionIntegrationCoordinator] Event listener removed for: ${eventType}`);
    }
  }

  // ============================================================================
  // COMPONENT LIFECYCLE MANAGEMENT (Following Template Pattern)
  // ============================================================================

  private async registerComponent(id: string, component: ProductionComponentLifecycle): Promise<void> {
    try {
      // Initialize component if not already initialized
      if (typeof component.initialize === 'function') {
        await component.initialize();
      }
      
      // Register component
      this.registeredComponents.set(id, component);
      
      console.log(`[ProductionIntegrationCoordinator] Component registered: ${id}`);
      
    } catch (error) {
      console.error(`[ProductionIntegrationCoordinator] Failed to register component ${id}:`, error);
      throw error;
    }
  }

  async unregisterComponent(id: string): Promise<void> {
    try {
      const component = this.registeredComponents.get(id);
      if (component) {
        // Shutdown component
        if (typeof component.shutdown === 'function') {
          await component.shutdown();
        }
        
        // Remove from registry
        this.registeredComponents.delete(id);
        
        console.log(`[ProductionIntegrationCoordinator] Component unregistered: ${id}`);
      }
      
    } catch (error) {
      console.error(`[ProductionIntegrationCoordinator] Failed to unregister component ${id}:`, error);
      throw error;
    }
  }

  async getComponentStatus(id: string): Promise<ProductionComponentStatus | null> {
    try {
      const component = this.registeredComponents.get(id);
      if (!component || typeof component.getStatus !== 'function') {
        return null;
      }
      
      return component.getStatus();
      
    } catch (error) {
      console.error(`[ProductionIntegrationCoordinator] Failed to get component status for ${id}:`, error);
      return null;
    }
  }

  async getAllComponentStatuses(): Promise<Map<string, ProductionComponentStatus>> {
    const statuses = new Map<string, ProductionComponentStatus>();
    
    for (const [id, component] of this.registeredComponents.entries()) {
      try {
        if (typeof component.getStatus === 'function') {
          const status = component.getStatus();
          statuses.set(id, status);
        }
      } catch (error) {
        console.error(`[ProductionIntegrationCoordinator] Failed to get status for component ${id}:`, error);
      }
    }
    
    return statuses;
  }

  // ============================================================================
  // UTILITY METHODS (Following Roadmap Naming Conventions)
  // ============================================================================

  private groupFeedbackBy(feedback: any[], property: string): Record<string, number> {
    return feedback.reduce((acc, item) => {
      const key = item[property];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  // ============================================================================
  // INITIALIZATION AND SHUTDOWN (Following Template Lifecycle)
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('[ProductionIntegrationCoordinator] Already initialized');
        return;
      }
      
      console.log('[ProductionIntegrationCoordinator] Initializing production integration coordinator...');
      
      // Initialize event listener maps
      this.eventListeners.clear();
      this.registeredComponents.clear();
      
      // Set up default event listeners
      this.setupDefaultEventListeners();
      
      this.isInitialized = true;
      console.log('[ProductionIntegrationCoordinator] Production integration coordinator initialized successfully');
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Failed to initialize:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      console.log('[ProductionIntegrationCoordinator] Shutting down production integration coordinator...');
      
      // Shutdown all registered components
      const shutdownPromises = Array.from(this.registeredComponents.entries()).map(
        async ([id, component]) => {
          try {
            if (typeof component.shutdown === 'function') {
              await component.shutdown();
            }
          } catch (error) {
            console.error(`[ProductionIntegrationCoordinator] Error shutting down component ${id}:`, error);
          }
        }
      );
      
      await Promise.allSettled(shutdownPromises);
      
      // Clear all data
      this.registeredComponents.clear();
      this.eventListeners.clear();
      this.systemStatusDisplay = null;
      this.userFeedbackCollector = null;
      this.progressIndicatorManager = null;
      this.isInitialized = false;
      
      console.log('[ProductionIntegrationCoordinator] Production integration coordinator shutdown complete');
      
    } catch (error) {
      console.error('[ProductionIntegrationCoordinator] Error during shutdown:', error);
      throw error;
    }
  }

  private setupDefaultEventListeners(): void {
    // Set up default event listeners for system events
    console.log('[ProductionIntegrationCoordinator] Setting up default event listeners');
    
    // These will be expanded during implementation
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  getRegisteredComponents(): string[] {
    return Array.from(this.registeredComponents.keys());
  }

  isComponentRegistered(id: string): boolean {
    return this.registeredComponents.has(id);
  }

  getEventListenerCount(eventType?: string): number {
    if (eventType) {
      return this.eventListeners.get(eventType)?.length || 0;
    }
    
    return Array.from(this.eventListeners.values())
      .reduce((total, listeners) => total + listeners.length, 0);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE (Following Roadmap Pattern)
// ============================================================================

export const productionIntegrationCoordinator = ProductionIntegrationCoordinatorImpl.getInstance();
export default productionIntegrationCoordinator;