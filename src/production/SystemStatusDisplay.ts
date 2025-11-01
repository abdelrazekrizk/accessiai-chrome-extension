/**
 * System Status Display - Task 17: Status and Feedback System
 * Real-time system status display with agent health indicators
 * Following Integration Phase Template System - Phase 3: Placeholder Implementation
 */

import type {
  SystemHealthReport,
  SystemStatus
} from '../types/index';

import type {
  SystemStatusDisplay as ISystemStatusDisplay,
  StatusDisplayState,
  StatusDisplayMode,
  StatusPosition,
  StatusIndicatorConfig,
  ProductionComponentStatus,
  ProductionComponentMetrics
} from '../types/production';

// ============================================================================
// SYSTEM STATUS DISPLAY IMPLEMENTATION
// ============================================================================

export class SystemStatusDisplay implements ISystemStatusDisplay {
  // ============================================================================
  // SINGLETON PATTERN (Following AccessiAI Roadmap)
  // ============================================================================

  private static instance: SystemStatusDisplay;
  
  static getInstance(): SystemStatusDisplay {
    if (!SystemStatusDisplay.instance) {
      SystemStatusDisplay.instance = new SystemStatusDisplay();
    }
    return SystemStatusDisplay.instance;
  }

  // ============================================================================
  // CORE PROPERTIES (Following Roadmap Variable Naming)
  // ============================================================================

  private statusElement: HTMLElement | null = null;
  private badgeElement: HTMLElement | null = null;
  private panelElement: HTMLElement | null = null;
  private currentStatus: SystemStatus = 'offline';
  private isVisible: boolean = false;
  private displayMode: StatusDisplayMode = 'badge';
  private position: StatusPosition = 'top-right';
  private lastUpdate: number = 0;
  private config: StatusIndicatorConfig;
  private isInitialized: boolean = false;
  private autoHideTimer: number | null = null;

  private constructor() {
    console.log('[SystemStatusDisplay] Initialized for Task 17');
    
    // Default configuration following roadmap patterns
    this.config = {
      showBadge: true,
      showNotifications: true,
      autoHide: false,
      autoHideDelay: 5000,
      position: 'top-right',
      theme: 'auto'
    };
  }

  // ============================================================================
  // INITIALIZATION AND LIFECYCLE (Following Template Pattern)
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('[SystemStatusDisplay] Already initialized');
        return;
      }

      console.log('[SystemStatusDisplay] Initializing system status display...');

      // Create status display elements
      await this.createStatusElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Apply initial configuration
      this.applyConfiguration();
      
      // Show initial status
      await this.showStatusIndicator('offline');

      this.isInitialized = true;
      console.log('[SystemStatusDisplay] System status display initialized successfully');

    } catch (error) {
      console.error('[SystemStatusDisplay] Failed to initialize:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      console.log('[SystemStatusDisplay] Shutting down system status display...');

      // Clear auto-hide timer
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
      }

      // Hide status indicator
      await this.hideStatusIndicator();

      // Remove event listeners
      this.removeEventListeners();

      // Remove DOM elements
      this.removeStatusElements();

      // Reset state
      this.currentStatus = 'offline';
      this.isVisible = false;
      this.lastUpdate = 0;
      this.isInitialized = false;

      console.log('[SystemStatusDisplay] System status display shutdown complete');

    } catch (error) {
      console.error('[SystemStatusDisplay] Error during shutdown:', error);
      throw error;
    }
  }

  // ============================================================================
  // STATUS UPDATE METHODS (Following Interface Design)
  // ============================================================================

  async updateStatus(healthReport: SystemHealthReport): Promise<void> {
    try {
      console.log(`[SystemStatusDisplay] Updating status to: ${healthReport.overallStatus}`);

      const previousStatus = this.currentStatus;
      this.currentStatus = healthReport.overallStatus;
      this.lastUpdate = Date.now();

      // Update visual indicators
      await this.updateStatusVisuals(healthReport);

      // Show notification if status changed
      if (previousStatus !== this.currentStatus && this.config.showNotifications) {
        await this.showStatusChangeNotification(previousStatus, this.currentStatus);
      }

      // Update badge if enabled
      if (this.config.showBadge) {
        await this.updateBadge(healthReport);
      }

      console.log(`[SystemStatusDisplay] Status updated successfully: ${this.currentStatus}`);

    } catch (error) {
      console.error('[SystemStatusDisplay] Failed to update status:', error);
      throw error;
    }
  }

  async showStatusIndicator(status: SystemStatus): Promise<void> {
    try {
      console.log(`[SystemStatusDisplay] Showing status indicator: ${status}`);

      this.currentStatus = status;
      this.isVisible = true;
      this.lastUpdate = Date.now();

      // Show appropriate display mode
      switch (this.displayMode) {
        case 'badge':
          await this.showBadge(status);
          break;
        case 'panel':
          await this.showPanel(status);
          break;
        case 'notification':
          await this.showNotification(status);
          break;
        case 'minimal':
          await this.showMinimal(status);
          break;
      }

      // Set up auto-hide if enabled
      if (this.config.autoHide) {
        this.setupAutoHide();
      }

      console.log(`[SystemStatusDisplay] Status indicator shown: ${status}`);

    } catch (error) {
      console.error('[SystemStatusDisplay] Failed to show status indicator:', error);
      throw error;
    }
  }

  async hideStatusIndicator(): Promise<void> {
    try {
      console.log('[SystemStatusDisplay] Hiding status indicator');

      this.isVisible = false;

      // Clear auto-hide timer
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
      }

      // Hide all display elements
      if (this.badgeElement) {
        this.badgeElement.style.display = 'none';
      }
      if (this.panelElement) {
        this.panelElement.style.display = 'none';
      }
      if (this.statusElement) {
        this.statusElement.style.display = 'none';
      }

      console.log('[SystemStatusDisplay] Status indicator hidden');

    } catch (error) {
      console.error('[SystemStatusDisplay] Failed to hide status indicator:', error);
      throw error;
    }
  }

  // ============================================================================
  // STATE MANAGEMENT (Following Template Interface)
  // ============================================================================

  getDisplayState(): StatusDisplayState {
    return {
      isVisible: this.isVisible,
      currentStatus: this.currentStatus,
      lastUpdate: this.lastUpdate,
      displayMode: this.displayMode,
      position: this.position
    };
  }

  // ============================================================================
  // COMPONENT LIFECYCLE INTERFACE IMPLEMENTATION
  // ============================================================================

  getStatus(): ProductionComponentStatus {
    return {
      componentId: 'system-status-display',
      name: 'System Status Display',
      status: this.isInitialized ? 'active' : 'offline',
      lastUpdate: this.lastUpdate,
      version: '1.0.0'
    };
  }

  getMetrics(): ProductionComponentMetrics {
    return {
      operationCount: 0, // Will be tracked in full implementation
      errorCount: 0,
      averageResponseTime: 0,
      lastOperationTime: this.lastUpdate,
      uptime: this.isInitialized ? Date.now() - this.lastUpdate : 0
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async createStatusElements(): Promise<void> {
    try {
      console.log('[SystemStatusDisplay] Creating status display elements');

      // Create main status container
      this.statusElement = document.createElement('div');
      this.statusElement.id = 'accessiai-status-display';
      this.statusElement.className = 'accessiai-status-container';
      
      // Create badge element
      this.badgeElement = document.createElement('div');
      this.badgeElement.className = 'accessiai-status-badge';
      this.badgeElement.setAttribute('role', 'status');
      this.badgeElement.setAttribute('aria-live', 'polite');
      
      // Create panel element
      this.panelElement = document.createElement('div');
      this.panelElement.className = 'accessiai-status-panel';
      this.panelElement.setAttribute('role', 'dialog');
      this.panelElement.setAttribute('aria-label', 'AccessiAI System Status');

      // Apply positioning
      this.applyPositioning();

      // Add to DOM
      document.body.appendChild(this.statusElement);
      this.statusElement.appendChild(this.badgeElement);
      this.statusElement.appendChild(this.panelElement);

      console.log('[SystemStatusDisplay] Status display elements created');

    } catch (error) {
      console.error('[SystemStatusDisplay] Failed to create status elements:', error);
      throw error;
    }
  }

  private removeStatusElements(): void {
    try {
      if (this.statusElement && this.statusElement.parentNode) {
        this.statusElement.parentNode.removeChild(this.statusElement);
      }
      
      this.statusElement = null;
      this.badgeElement = null;
      this.panelElement = null;

      console.log('[SystemStatusDisplay] Status display elements removed');

    } catch (error) {
      console.error('[SystemStatusDisplay] Error removing status elements:', error);
    }
  }

  private setupEventListeners(): void {
    try {
      console.log('[SystemStatusDisplay] Setting up event listeners');

      // Badge click handler
      if (this.badgeElement) {
        this.badgeElement.addEventListener('click', this.handleBadgeClick.bind(this));
      }

      // Keyboard navigation
      document.addEventListener('keydown', this.handleKeyDown.bind(this));

      console.log('[SystemStatusDisplay] Event listeners set up');

    } catch (error) {
      console.error('[SystemStatusDisplay] Error setting up event listeners:', error);
    }
  }

  private removeEventListeners(): void {
    try {
      if (this.badgeElement) {
        this.badgeElement.removeEventListener('click', this.handleBadgeClick.bind(this));
      }

      document.removeEventListener('keydown', this.handleKeyDown.bind(this));

      console.log('[SystemStatusDisplay] Event listeners removed');

    } catch (error) {
      console.error('[SystemStatusDisplay] Error removing event listeners:', error);
    }
  }

  private applyConfiguration(): void {
    try {
      console.log('[SystemStatusDisplay] Applying configuration');

      // Apply theme
      if (this.statusElement) {
        this.statusElement.setAttribute('data-theme', this.config.theme);
      }

      // Apply positioning
      this.applyPositioning();

      console.log('[SystemStatusDisplay] Configuration applied');

    } catch (error) {
      console.error('[SystemStatusDisplay] Error applying configuration:', error);
    }
  }

  private applyPositioning(): void {
    if (!this.statusElement) return;

    const positions = {
      'top-left': { top: '20px', left: '20px', right: 'auto', bottom: 'auto' },
      'top-right': { top: '20px', right: '20px', left: 'auto', bottom: 'auto' },
      'bottom-left': { bottom: '20px', left: '20px', right: 'auto', top: 'auto' },
      'bottom-right': { bottom: '20px', right: '20px', left: 'auto', top: 'auto' }
    };

    const pos = positions[this.position];
    Object.assign(this.statusElement.style, {
      position: 'fixed',
      zIndex: '10000',
      ...pos
    });
  }

  private async updateStatusVisuals(healthReport: SystemHealthReport): Promise<void> {
    try {
      // Update badge
      if (this.badgeElement) {
        this.badgeElement.className = `accessiai-status-badge status-${healthReport.overallStatus}`;
        this.badgeElement.textContent = this.getStatusText(healthReport.overallStatus);
        this.badgeElement.setAttribute('aria-label', `System status: ${healthReport.overallStatus}`);
      }

      // Update panel content
      if (this.panelElement) {
        this.panelElement.innerHTML = this.generatePanelContent(healthReport);
      }

    } catch (error) {
      console.error('[SystemStatusDisplay] Error updating status visuals:', error);
    }
  }

  private async showBadge(status: SystemStatus): Promise<void> {
    if (!this.badgeElement) return;

    this.badgeElement.style.display = 'block';
    this.badgeElement.className = `accessiai-status-badge status-${status}`;
    this.badgeElement.textContent = this.getStatusText(status);
  }

  private async showPanel(status: SystemStatus): Promise<void> {
    if (!this.panelElement) return;

    this.panelElement.style.display = 'block';
    this.panelElement.innerHTML = this.generatePanelContent({ overallStatus: status } as SystemHealthReport);
  }

  private async showNotification(status: SystemStatus): Promise<void> {
    // Implementation for notification display
    console.log(`[SystemStatusDisplay] Showing notification for status: ${status}`);
  }

  private async showMinimal(status: SystemStatus): Promise<void> {
    // Implementation for minimal display
    console.log(`[SystemStatusDisplay] Showing minimal display for status: ${status}`);
  }

  private async showStatusChangeNotification(oldStatus: SystemStatus, newStatus: SystemStatus): Promise<void> {
    console.log(`[SystemStatusDisplay] Status changed from ${oldStatus} to ${newStatus}`);
    // Implementation for status change notifications
  }

  private async updateBadge(healthReport: SystemHealthReport): Promise<void> {
    if (!this.badgeElement) return;

    this.badgeElement.className = `accessiai-status-badge status-${healthReport.overallStatus}`;
    this.badgeElement.textContent = this.getStatusText(healthReport.overallStatus);
  }

  private setupAutoHide(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }

    this.autoHideTimer = window.setTimeout(() => {
      this.hideStatusIndicator();
    }, this.config.autoHideDelay);
  }

  private getStatusText(status: SystemStatus): string {
    const statusTexts: Record<SystemStatus, string> = {
      'healthy': '✓',
      'degraded': '⚠',
      'critical': '✗',
      'offline': '○'
    };
    return statusTexts[status] || '?';
  }

  private generatePanelContent(healthReport: SystemHealthReport): string {
    return `
      <div class="status-panel-header">
        <h3>AccessiAI System Status</h3>
        <span class="status-indicator status-${healthReport.overallStatus}">
          ${this.getStatusText(healthReport.overallStatus)} ${healthReport.overallStatus}
        </span>
      </div>
      <div class="status-panel-content">
        <p>Last updated: ${new Date(this.lastUpdate).toLocaleTimeString()}</p>
        <p>Agents: ${healthReport.agents?.length || 0} active</p>
      </div>
    `;
  }

  private handleBadgeClick(): void {
    console.log('[SystemStatusDisplay] Badge clicked');
    // Toggle panel display
    if (this.displayMode === 'badge') {
      this.displayMode = 'panel';
      this.showPanel(this.currentStatus);
    } else {
      this.displayMode = 'badge';
      this.showBadge(this.currentStatus);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Handle keyboard shortcuts for accessibility
    if (event.altKey && event.key === 's') {
      event.preventDefault();
      this.handleBadgeClick();
    }
  }

  // ============================================================================
  // PUBLIC CONFIGURATION METHODS
  // ============================================================================

  updateConfiguration(config: Partial<StatusIndicatorConfig>): void {
    this.config = { ...this.config, ...config };
    this.applyConfiguration();
    console.log('[SystemStatusDisplay] Configuration updated');
  }

  setDisplayMode(mode: StatusDisplayMode): void {
    this.displayMode = mode;
    console.log(`[SystemStatusDisplay] Display mode set to: ${mode}`);
  }

  setPosition(position: StatusPosition): void {
    this.position = position;
    this.applyPositioning();
    console.log(`[SystemStatusDisplay] Position set to: ${position}`);
  }
}