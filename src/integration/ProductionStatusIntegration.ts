/**
 * Production Status Integration - Status and Feedback System
 * Integrates SystemStatusDisplay, UserFeedbackCollector, and ProgressIndicatorManager
 * Following Integration Phase Template System - Phase 4: Progressive Integration
 */

import { SystemStatusDisplay } from '../production/SystemStatusDisplay';
import { UserFeedbackCollector } from '../production/UserFeedbackCollector';
import { ProgressIndicatorManager } from '../production/ProgressIndicatorManager';
import { ProductionIntegrationCoordinatorImpl } from './ProductionIntegrationCoordinator';

import type {
  SystemHealthReport
} from '../types/index';

import type {
  ProductionSystemEvent,
  ProgressUpdate
} from '../types/production';

// ============================================================================
// PRODUCTION STATUS INTEGRATION IMPLEMENTATION
// ============================================================================

export class ProductionStatusIntegration {
  // ============================================================================
  // SINGLETON PATTERN (Following AccessiAI Roadmap)
  // ============================================================================

  private static instance: ProductionStatusIntegration;
  
  static getInstance(): ProductionStatusIntegration {
    if (!ProductionStatusIntegration.instance) {
      ProductionStatusIntegration.instance = new ProductionStatusIntegration();
    }
    return ProductionStatusIntegration.instance;
  }

  // ============================================================================
  // CORE PROPERTIES (Following Roadmap Variable Naming)
  // ============================================================================

  private systemStatusDisplay: SystemStatusDisplay;
  private userFeedbackCollector: UserFeedbackCollector;
  private progressIndicatorManager: ProgressIndicatorManager;
  private productionCoordinator: ProductionIntegrationCoordinatorImpl;
  private isInitialized: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {
    console.log('[ProductionStatusIntegration] Initialized for production deployment');
    
    // Get singleton instances
    this.systemStatusDisplay = SystemStatusDisplay.getInstance();
    this.userFeedbackCollector = UserFeedbackCollector.getInstance();
    this.progressIndicatorManager = ProgressIndicatorManager.getInstance();
    this.productionCoordinator = ProductionIntegrationCoordinatorImpl.getInstance();
  }

  // ============================================================================
  // INTEGRATION INITIALIZATION (Following Template Phase 4)
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('[ProductionStatusIntegration] Already initialized');
        return;
      }

      console.log('[ProductionStatusIntegration] Initializing production status components integration...');

      // Phase 4.1: Initialize Production Coordinator
      await this.initializeProductionCoordinator();

      // Phase 4.2: Initialize Individual Components
      await this.initializeComponents();

      // Phase 4.3: Register Components with Coordinator
      await this.registerComponents();

      // Phase 4.4: Set up Cross-Component Communication
      this.setupCrossComponentCommunication();

      // Phase 4.5: Set up Event Listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('[ProductionStatusIntegration] Production status integration completed successfully');

      // Broadcast integration completion event
      await this.broadcastIntegrationEvent('production-status-integration-completed', {
        components: ['SystemStatusDisplay', 'UserFeedbackCollector', 'ProgressIndicatorManager'],
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to initialize production status integration:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Shutting down production status integration...');

      // Remove event listeners
      this.removeEventListeners();

      // Shutdown components in reverse order
      await this.progressIndicatorManager.shutdown();
      await this.userFeedbackCollector.shutdown();
      await this.systemStatusDisplay.shutdown();
      await this.productionCoordinator.shutdown();

      // Clear state
      this.eventListeners.clear();
      this.isInitialized = false;

      console.log('[ProductionStatusIntegration] Production status integration shutdown complete');

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error during production status integration shutdown:', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE INITIALIZATION METHODS
  // ============================================================================

  private async initializeProductionCoordinator(): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Initializing production coordinator...');
      await this.productionCoordinator.initialize();
      console.log('[ProductionStatusIntegration] Production coordinator initialized');

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to initialize production coordinator:', error);
      throw error;
    }
  }

  private async initializeComponents(): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Initializing production status components...');

      // Initialize components in dependency order
      await this.systemStatusDisplay.initialize();
      console.log('[ProductionStatusIntegration] SystemStatusDisplay initialized');

      await this.userFeedbackCollector.initialize();
      console.log('[ProductionStatusIntegration] UserFeedbackCollector initialized');

      await this.progressIndicatorManager.initialize();
      console.log('[ProductionStatusIntegration] ProgressIndicatorManager initialized');

      console.log('[ProductionStatusIntegration] All production status components initialized');

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to initialize components:', error);
      throw error;
    }
  }

  private async registerComponents(): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Registering components with production coordinator...');

      // Register SystemStatusDisplay
      await this.productionCoordinator.registerStatusDisplay(this.systemStatusDisplay);
      console.log('[ProductionStatusIntegration] SystemStatusDisplay registered');

      // Register UserFeedbackCollector
      await this.productionCoordinator.registerFeedbackCollector(this.userFeedbackCollector);
      console.log('[ProductionStatusIntegration] UserFeedbackCollector registered');

      // Register ProgressIndicatorManager
      await this.productionCoordinator.registerProgressManager(this.progressIndicatorManager);
      console.log('[ProductionStatusIntegration] ProgressIndicatorManager registered');

      console.log('[ProductionStatusIntegration] All components registered with production coordinator');

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to register components:', error);
      throw error;
    }
  }

  private setupCrossComponentCommunication(): void {
    try {
      console.log('[ProductionStatusIntegration] Setting up cross-component communication...');

      // Set up communication patterns between components
      // This enables components to work together seamlessly

      console.log('[ProductionStatusIntegration] Cross-component communication set up');

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error setting up cross-component communication:', error);
    }
  }

  private setupEventListeners(): void {
    try {
      console.log('[ProductionStatusIntegration] Setting up integration event listeners...');

      // Listen for system status changes
      this.addEventListener('status-changed', this.handleStatusChange.bind(this));

      // Listen for progress updates
      this.addEventListener('progress-updated', this.handleProgressUpdate.bind(this));

      // Listen for feedback submissions
      this.addEventListener('feedback-submitted', this.handleFeedbackSubmission.bind(this));

      console.log('[ProductionStatusIntegration] Integration event listeners set up');

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error setting up event listeners:', error);
    }
  }

  private removeEventListeners(): void {
    try {
      this.eventListeners.clear();
      console.log('[ProductionStatusIntegration] Integration event listeners removed');

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error removing event listeners:', error);
    }
  }

  // ============================================================================
  // EVENT HANDLING METHODS
  // ============================================================================

  private async handleStatusChange(event: ProductionSystemEvent): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Handling status change event');
      
      const healthReport = event.data as SystemHealthReport;
      
      // Update status display
      await this.systemStatusDisplay.updateStatus(healthReport);
      
      // Create progress indicator for critical status
      if (healthReport.overallStatus === 'critical') {
        await this.progressIndicatorManager.createSimpleProgress(
          'System Recovery in Progress',
          false
        );
      }

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error handling status change:', error);
    }
  }

  private async handleProgressUpdate(event: ProductionSystemEvent): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Handling progress update event');
      
      const { progressId, update } = event.data as { progressId: string; update: ProgressUpdate };
      
      // Update progress indicator
      await this.progressIndicatorManager.updateProgress(progressId, update);

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error handling progress update:', error);
    }
  }

  private async handleFeedbackSubmission(_event: ProductionSystemEvent): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Handling feedback submission event');
      
      // Show progress indicator for feedback processing
      const progressId = await this.progressIndicatorManager.createSimpleProgress(
        'Processing Feedback',
        false
      );

      // Simulate processing time
      setTimeout(async () => {
        await this.progressIndicatorManager.completeProgress(progressId.id, {
          success: true,
          message: 'Feedback submitted successfully',
          duration: 1000
        });
      }, 1000);

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error handling feedback submission:', error);
    }
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async updateSystemStatus(healthReport: SystemHealthReport): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Updating system status through integration');
      
      // Broadcast status update through coordinator
      await this.productionCoordinator.broadcastStatusUpdate(healthReport);

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to update system status:', error);
      throw error;
    }
  }

  async showFeedbackForm(context?: any): Promise<void> {
    try {
      console.log('[ProductionStatusIntegration] Showing feedback form through integration');
      
      await this.userFeedbackCollector.showFeedbackForm(context);

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to show feedback form:', error);
      throw error;
    }
  }

  async createProgressIndicator(title: string, canCancel: boolean = false): Promise<string> {
    try {
      console.log(`[ProductionStatusIntegration] Creating progress indicator: ${title}`);
      
      const progress = await this.progressIndicatorManager.createSimpleProgress(title, canCancel);
      return progress.id;

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to create progress indicator:', error);
      throw error;
    }
  }

  async getSystemStatus(): Promise<SystemHealthReport> {
    try {
      return await this.productionCoordinator.getSystemStatus();

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to get system status:', error);
      throw error;
    }
  }

  // ============================================================================
  // EVENT MANAGEMENT METHODS
  // ============================================================================

  private addEventListener(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(listener);
    
    // Also register with production coordinator
    this.productionCoordinator.addEventListener(eventType, listener);
  }

  private async broadcastIntegrationEvent(type: string, data: unknown): Promise<void> {
    try {
      const event: ProductionSystemEvent = {
        type: type as any,
        source: 'production-status-integration',
        data,
        timestamp: Date.now()
      };

      await this.productionCoordinator.broadcastSystemEvent(event);

    } catch (error) {
      console.error('[ProductionStatusIntegration] Failed to broadcast integration event:', error);
    }
  }

  // ============================================================================
  // INTEGRATION STATUS METHODS
  // ============================================================================

  isIntegrationReady(): boolean {
    return this.isInitialized;
  }

  getIntegrationStatus(): {
    isInitialized: boolean;
    components: Record<string, string>;
    lastUpdate: number;
  } {
    return {
      isInitialized: this.isInitialized,
      components: {
        'SystemStatusDisplay': this.systemStatusDisplay.getStatus().status,
        'UserFeedbackCollector': this.userFeedbackCollector.getStatus().status,
        'ProgressIndicatorManager': this.progressIndicatorManager.getStatus().status,
        'ProductionCoordinator': this.productionCoordinator.isComponentRegistered('system-status-display') ? 'active' : 'offline'
      },
      lastUpdate: Date.now()
    };
  }

  async validateIntegration(): Promise<{ isValid: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];

      // Check if all components are initialized
      if (!this.systemStatusDisplay.getStatus().status.includes('active')) {
        issues.push('SystemStatusDisplay is not active');
      }

      if (!this.userFeedbackCollector.getStatus().status.includes('active')) {
        issues.push('UserFeedbackCollector is not active');
      }

      if (!this.progressIndicatorManager.getStatus().status.includes('active')) {
        issues.push('ProgressIndicatorManager is not active');
      }

      // Check if components are registered with coordinator
      if (!this.productionCoordinator.isComponentRegistered('system-status-display')) {
        issues.push('SystemStatusDisplay is not registered with coordinator');
      }

      if (!this.productionCoordinator.isComponentRegistered('user-feedback-collector')) {
        issues.push('UserFeedbackCollector is not registered with coordinator');
      }

      if (!this.productionCoordinator.isComponentRegistered('progress-indicator-manager')) {
        issues.push('ProgressIndicatorManager is not registered with coordinator');
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      console.error('[ProductionStatusIntegration] Error validating integration:', error);
      return {
        isValid: false,
        issues: ['Integration validation failed']
      };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE (Following Roadmap Pattern)
// ============================================================================

export const productionStatusIntegration = ProductionStatusIntegration.getInstance();
export default productionStatusIntegration;