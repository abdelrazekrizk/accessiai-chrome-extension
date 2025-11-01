/**
 * Progress Indicator Manager - Task 17: Status and Feedback System
 * Progress indicators for long-running operations
 * Following Integration Phase Template System - Phase 3: Placeholder Implementation
 */

import type {
  ProgressIndicatorManager as IProgressIndicatorManager,
  ProgressIndicator,
  ProgressConfig,
  ProgressUpdate,
  ProgressResult,
  ProgressStatus,
  ProgressNotificationConfig,
  ProductionComponentStatus,
  ProductionComponentMetrics
} from '../types/production';

// ============================================================================
// PROGRESS INDICATOR MANAGER IMPLEMENTATION
// ============================================================================

export class ProgressIndicatorManager implements IProgressIndicatorManager {
  // ============================================================================
  // SINGLETON PATTERN (Following AccessiAI Roadmap)
  // ============================================================================

  private static instance: ProgressIndicatorManager;
  
  static getInstance(): ProgressIndicatorManager {
    if (!ProgressIndicatorManager.instance) {
      ProgressIndicatorManager.instance = new ProgressIndicatorManager();
    }
    return ProgressIndicatorManager.instance;
  }

  // ============================================================================
  // CORE PROPERTIES (Following Roadmap Variable Naming)
  // ============================================================================

  private activeProgress: Map<string, ProgressIndicator> = new Map();
  private progressContainer: HTMLElement | null = null;
  private notificationConfig: ProgressNotificationConfig;
  private isInitialized: boolean = false;
  private operationCount: number = 0;
  private errorCount: number = 0;
  private lastOperationTime: number = 0;
  private initializationTime: number = 0;
  private progressIdCounter: number = 0;

  private constructor() {
    console.log('[ProgressIndicatorManager] Initialized for Task 17');
    
    // Default notification configuration following roadmap patterns
    this.notificationConfig = {
      showStartNotification: false,
      showProgressNotification: false,
      showCompletionNotification: true,
      showErrorNotification: true,
      autoHideDelay: 3000,
      soundEnabled: false
    };
  }

  // ============================================================================
  // INITIALIZATION AND LIFECYCLE (Following Template Pattern)
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('[ProgressIndicatorManager] Already initialized');
        return;
      }

      console.log('[ProgressIndicatorManager] Initializing progress indicator manager...');
      this.initializationTime = Date.now();

      // Create progress container
      await this.createProgressContainer();
      
      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('[ProgressIndicatorManager] Progress indicator manager initialized successfully');

    } catch (error) {
      console.error('[ProgressIndicatorManager] Failed to initialize:', error);
      this.errorCount++;
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      console.log('[ProgressIndicatorManager] Shutting down progress indicator manager...');

      // Cancel all active progress indicators
      const activeIds = Array.from(this.activeProgress.keys());
      for (const id of activeIds) {
        await this.cancelProgress(id);
      }

      // Remove event listeners
      this.removeEventListeners();

      // Remove DOM elements
      this.removeProgressContainer();

      // Reset state
      this.activeProgress.clear();
      this.isInitialized = false;

      console.log('[ProgressIndicatorManager] Progress indicator manager shutdown complete');

    } catch (error) {
      console.error('[ProgressIndicatorManager] Error during shutdown:', error);
      this.errorCount++;
      throw error;
    }
  }

  // ============================================================================
  // PROGRESS MANAGEMENT METHODS (Following Interface Design)
  // ============================================================================

  async createProgress(config: ProgressConfig): Promise<ProgressIndicator> {
    try {
      console.log(`[ProgressIndicatorManager] Creating progress indicator: ${config.title}`);
      this.operationCount++;
      this.lastOperationTime = Date.now();

      // Generate unique ID
      const id = `progress-${++this.progressIdCounter}-${Date.now()}`;

      // Create progress indicator
      const progressIndicator: ProgressIndicator = {
        id,
        title: config.title,
        type: config.type,
        status: 'pending',
        progress: config.type === 'indeterminate' ? -1 : 0,
        startTime: Date.now(),
        ...(config.estimatedDuration !== undefined && { estimatedDuration: config.estimatedDuration }),
        ...(config.totalSteps !== undefined && { totalSteps: config.totalSteps }),
        completedSteps: 0,
        canCancel: config.canCancel,
        metadata: config.metadata || {}
      };

      // Add to active progress
      this.activeProgress.set(id, progressIndicator);

      // Create visual indicator
      await this.createProgressVisual(progressIndicator);

      // Show start notification if enabled
      if (this.notificationConfig.showStartNotification) {
        await this.showProgressNotification(progressIndicator, 'started');
      }

      console.log(`[ProgressIndicatorManager] Progress indicator created: ${id}`);
      return progressIndicator;

    } catch (error) {
      console.error('[ProgressIndicatorManager] Failed to create progress indicator:', error);
      this.errorCount++;
      throw error;
    }
  }

  async updateProgress(id: string, update: ProgressUpdate): Promise<void> {
    try {
      console.log(`[ProgressIndicatorManager] Updating progress: ${id}`);
      this.operationCount++;
      this.lastOperationTime = Date.now();

      const progressIndicator = this.activeProgress.get(id);
      if (!progressIndicator) {
        throw new Error(`Progress indicator not found: ${id}`);
      }

      // Update progress indicator
      const updatedProgress: ProgressIndicator = {
        ...progressIndicator,
        progress: update.progress !== undefined ? update.progress : progressIndicator.progress,
        ...(update.currentStep && { currentStep: update.currentStep }),
        ...(update.completedSteps !== undefined && { completedSteps: update.completedSteps }),
        ...(update.estimatedDuration !== undefined && { estimatedDuration: update.estimatedDuration }),
        status: update.status || progressIndicator.status,
        metadata: { ...progressIndicator.metadata, ...(update.metadata || {}) }
      };

      // Update in map
      this.activeProgress.set(id, updatedProgress);

      // Update visual indicator
      await this.updateProgressVisual(updatedProgress);

      // Show progress notification if enabled
      if (this.notificationConfig.showProgressNotification) {
        await this.showProgressNotification(updatedProgress, 'updated');
      }

      console.log(`[ProgressIndicatorManager] Progress updated: ${id} - ${updatedProgress.progress}%`);

    } catch (error) {
      console.error(`[ProgressIndicatorManager] Failed to update progress ${id}:`, error);
      this.errorCount++;
      throw error;
    }
  }

  async completeProgress(id: string, result?: ProgressResult): Promise<void> {
    try {
      console.log(`[ProgressIndicatorManager] Completing progress: ${id}`);
      this.operationCount++;
      this.lastOperationTime = Date.now();

      const progressIndicator = this.activeProgress.get(id);
      if (!progressIndicator) {
        throw new Error(`Progress indicator not found: ${id}`);
      }

      // Update status to completed
      const completedSteps = progressIndicator.totalSteps !== undefined ? 
        progressIndicator.totalSteps : progressIndicator.completedSteps;
      
      const completedProgress: ProgressIndicator = {
        ...progressIndicator,
        status: 'completed',
        progress: progressIndicator.type === 'indeterminate' ? -1 : 100,
        ...(completedSteps !== undefined && { completedSteps }),
        metadata: { ...progressIndicator.metadata, result }
      };

      // Update in map
      this.activeProgress.set(id, completedProgress);

      // Update visual indicator
      await this.updateProgressVisual(completedProgress);

      // Show completion notification if enabled
      if (this.notificationConfig.showCompletionNotification) {
        await this.showProgressNotification(completedProgress, 'completed');
      }

      // Auto-hide after delay
      setTimeout(() => {
        this.removeProgressVisual(id);
        this.activeProgress.delete(id);
      }, this.notificationConfig.autoHideDelay);

      console.log(`[ProgressIndicatorManager] Progress completed: ${id}`);

    } catch (error) {
      console.error(`[ProgressIndicatorManager] Failed to complete progress ${id}:`, error);
      this.errorCount++;
      throw error;
    }
  }

  async cancelProgress(id: string): Promise<void> {
    try {
      console.log(`[ProgressIndicatorManager] Cancelling progress: ${id}`);
      this.operationCount++;
      this.lastOperationTime = Date.now();

      const progressIndicator = this.activeProgress.get(id);
      if (!progressIndicator) {
        throw new Error(`Progress indicator not found: ${id}`);
      }

      if (!progressIndicator.canCancel) {
        throw new Error(`Progress indicator cannot be cancelled: ${id}`);
      }

      // Update status to cancelled
      const cancelledProgress: ProgressIndicator = {
        ...progressIndicator,
        status: 'cancelled'
      };

      // Update in map
      this.activeProgress.set(id, cancelledProgress);

      // Update visual indicator
      await this.updateProgressVisual(cancelledProgress);

      // Remove after short delay
      setTimeout(() => {
        this.removeProgressVisual(id);
        this.activeProgress.delete(id);
      }, 1000);

      console.log(`[ProgressIndicatorManager] Progress cancelled: ${id}`);

    } catch (error) {
      console.error(`[ProgressIndicatorManager] Failed to cancel progress ${id}:`, error);
      this.errorCount++;
      throw error;
    }
  }

  async getActiveProgress(): Promise<ProgressIndicator[]> {
    try {
      console.log('[ProgressIndicatorManager] Retrieving active progress indicators');
      this.operationCount++;
      this.lastOperationTime = Date.now();

      return Array.from(this.activeProgress.values());

    } catch (error) {
      console.error('[ProgressIndicatorManager] Failed to get active progress:', error);
      this.errorCount++;
      throw error;
    }
  }

  // ============================================================================
  // COMPONENT LIFECYCLE INTERFACE IMPLEMENTATION
  // ============================================================================

  getStatus(): ProductionComponentStatus {
    return {
      componentId: 'progress-indicator-manager',
      name: 'Progress Indicator Manager',
      status: this.isInitialized ? 'active' : 'offline',
      lastUpdate: this.lastOperationTime,
      version: '1.0.0'
    };
  }

  getMetrics(): ProductionComponentMetrics {
    return {
      operationCount: this.operationCount,
      errorCount: this.errorCount,
      averageResponseTime: 0, // Will be calculated in full implementation
      lastOperationTime: this.lastOperationTime,
      uptime: this.isInitialized ? Date.now() - this.initializationTime : 0
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async createProgressContainer(): Promise<void> {
    try {
      console.log('[ProgressIndicatorManager] Creating progress container');

      this.progressContainer = document.createElement('div');
      this.progressContainer.id = 'accessiai-progress-container';
      this.progressContainer.className = 'accessiai-progress-container';
      this.progressContainer.setAttribute('role', 'status');
      this.progressContainer.setAttribute('aria-live', 'polite');
      this.progressContainer.setAttribute('aria-label', 'Progress indicators');

      // Position container
      Object.assign(this.progressContainer.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '10001',
        maxWidth: '300px',
        pointerEvents: 'none'
      });

      // Add to DOM
      document.body.appendChild(this.progressContainer);

      console.log('[ProgressIndicatorManager] Progress container created');

    } catch (error) {
      console.error('[ProgressIndicatorManager] Failed to create progress container:', error);
      throw error;
    }
  }

  private removeProgressContainer(): void {
    try {
      if (this.progressContainer && this.progressContainer.parentNode) {
        this.progressContainer.parentNode.removeChild(this.progressContainer);
      }
      
      this.progressContainer = null;
      console.log('[ProgressIndicatorManager] Progress container removed');

    } catch (error) {
      console.error('[ProgressIndicatorManager] Error removing progress container:', error);
    }
  }

  private setupEventListeners(): void {
    try {
      console.log('[ProgressIndicatorManager] Setting up event listeners');

      // Keyboard navigation for cancellable progress
      document.addEventListener('keydown', this.handleKeyDown.bind(this));

      console.log('[ProgressIndicatorManager] Event listeners set up');

    } catch (error) {
      console.error('[ProgressIndicatorManager] Error setting up event listeners:', error);
    }
  }

  private removeEventListeners(): void {
    try {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
      console.log('[ProgressIndicatorManager] Event listeners removed');

    } catch (error) {
      console.error('[ProgressIndicatorManager] Error removing event listeners:', error);
    }
  }

  private async createProgressVisual(progress: ProgressIndicator): Promise<void> {
    try {
      if (!this.progressContainer) return;

      const progressElement = document.createElement('div');
      progressElement.id = `progress-${progress.id}`;
      progressElement.className = `progress-indicator status-${progress.status}`;
      progressElement.setAttribute('role', 'progressbar');
      progressElement.setAttribute('aria-label', progress.title);
      
      if (progress.type !== 'indeterminate') {
        progressElement.setAttribute('aria-valuemin', '0');
        progressElement.setAttribute('aria-valuemax', '100');
        progressElement.setAttribute('aria-valuenow', progress.progress.toString());
      }

      progressElement.innerHTML = this.generateProgressHTML(progress);

      // Add cancel handler if cancellable
      if (progress.canCancel) {
        const cancelButton = progressElement.querySelector('.cancel-button');
        if (cancelButton) {
          cancelButton.addEventListener('click', () => this.cancelProgress(progress.id));
        }
      }

      this.progressContainer.appendChild(progressElement);

      console.log(`[ProgressIndicatorManager] Progress visual created: ${progress.id}`);

    } catch (error) {
      console.error(`[ProgressIndicatorManager] Failed to create progress visual for ${progress.id}:`, error);
    }
  }

  private async updateProgressVisual(progress: ProgressIndicator): Promise<void> {
    try {
      if (!this.progressContainer) return;

      const progressElement = this.progressContainer.querySelector(`#progress-${progress.id}`);
      if (!progressElement) return;

      // Update attributes
      progressElement.className = `progress-indicator status-${progress.status}`;
      if (progress.type !== 'indeterminate') {
        progressElement.setAttribute('aria-valuenow', progress.progress.toString());
      }

      // Update content
      progressElement.innerHTML = this.generateProgressHTML(progress);

      console.log(`[ProgressIndicatorManager] Progress visual updated: ${progress.id}`);

    } catch (error) {
      console.error(`[ProgressIndicatorManager] Failed to update progress visual for ${progress.id}:`, error);
    }
  }

  private removeProgressVisual(id: string): void {
    try {
      if (!this.progressContainer) return;

      const progressElement = this.progressContainer.querySelector(`#progress-${id}`);
      if (progressElement) {
        progressElement.remove();
      }

      console.log(`[ProgressIndicatorManager] Progress visual removed: ${id}`);

    } catch (error) {
      console.error(`[ProgressIndicatorManager] Error removing progress visual for ${id}:`, error);
    }
  }

  private generateProgressHTML(progress: ProgressIndicator): string {
    const progressPercentage = progress.type === 'indeterminate' ? 0 : progress.progress;
    const statusIcon = this.getStatusIcon(progress.status);
    const cancelButton = progress.canCancel && progress.status === 'running' ? 
      '<button class="cancel-button" aria-label="Cancel operation">×</button>' : '';

    return `
      <div class="progress-header">
        <span class="progress-title">${progress.title}</span>
        ${cancelButton}
      </div>
      <div class="progress-body">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="progress-info">
          <span class="progress-status">${statusIcon} ${progress.status}</span>
          ${progress.currentStep ? `<span class="progress-step">${progress.currentStep}</span>` : ''}
          ${progress.totalSteps ? `<span class="progress-steps">${progress.completedSteps || 0}/${progress.totalSteps}</span>` : ''}
        </div>
      </div>
    `;
  }

  private getStatusIcon(status: ProgressStatus): string {
    const statusIcons = {
      'pending': '⏳',
      'running': '⚡',
      'paused': '⏸️',
      'completed': '✅',
      'cancelled': '❌',
      'error': '❌'
    };
    return statusIcons[status] || '❓';
  }

  private async showProgressNotification(progress: ProgressIndicator, action: string): Promise<void> {
    try {
      console.log(`[ProgressIndicatorManager] Showing ${action} notification for: ${progress.title}`);
      
      // In a full implementation, this would show browser notifications
      // For now, just log the notification
      
    } catch (error) {
      console.error(`[ProgressIndicatorManager] Failed to show ${action} notification:`, error);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Handle Escape key to cancel active progress (if any are cancellable)
    if (event.key === 'Escape') {
      const cancellableProgress = Array.from(this.activeProgress.values())
        .find(p => p.canCancel && p.status === 'running');
      
      if (cancellableProgress) {
        event.preventDefault();
        this.cancelProgress(cancellableProgress.id);
      }
    }
  }

  // ============================================================================
  // PUBLIC CONFIGURATION METHODS
  // ============================================================================

  updateNotificationConfig(config: Partial<ProgressNotificationConfig>): void {
    this.notificationConfig = { ...this.notificationConfig, ...config };
    console.log('[ProgressIndicatorManager] Notification configuration updated');
  }

  getActiveProgressCount(): number {
    return this.activeProgress.size;
  }

  getProgressById(id: string): ProgressIndicator | undefined {
    return this.activeProgress.get(id);
  }

  getProgressByStatus(status: ProgressStatus): ProgressIndicator[] {
    return Array.from(this.activeProgress.values()).filter(p => p.status === status);
  }

  hasActiveProgress(): boolean {
    return this.activeProgress.size > 0;
  }

  // ============================================================================
  // UTILITY METHODS FOR COMMON PROGRESS PATTERNS
  // ============================================================================

  async createSimpleProgress(title: string, canCancel: boolean = false): Promise<ProgressIndicator> {
    return this.createProgress({
      title,
      type: 'indeterminate',
      canCancel,
      showInBadge: false,
      showNotification: false
    });
  }

  async createSteppedProgress(title: string, totalSteps: number, canCancel: boolean = false): Promise<ProgressIndicator> {
    return this.createProgress({
      title,
      type: 'stepped',
      totalSteps,
      canCancel,
      showInBadge: true,
      showNotification: true
    });
  }

  async createTimedProgress(title: string, estimatedDuration: number, canCancel: boolean = false): Promise<ProgressIndicator> {
    return this.createProgress({
      title,
      type: 'determinate',
      estimatedDuration,
      canCancel,
      showInBadge: true,
      showNotification: true
    });
  }
}