/**
 * AccessiAI Extension Popup
 * Main user interface for accessibility analysis and controls
 * Provides system status, quick actions, and page analysis results
 */

import type { SystemHealthReport, MessageBusStatus } from './types/index';

// ============================================================================
// POPUP INTERFACE CONTROLLER
// ============================================================================

class PopupController {
  private systemHealth: SystemHealthReport | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      console.log('[AccessiAI] Initializing popup...');
      
      // Set up UI event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadSystemHealth();
      
      // Render initial UI
      this.renderUI();
      
      // Start auto-refresh
      this.startAutoRefresh();
      
      console.log('[AccessiAI] Popup initialized successfully');
      
    } catch (error) {
      console.error('[AccessiAI] Popup initialization failed:', error);
      this.showError('Failed to initialize AccessiAI popup');
    }
  }

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  private async loadSystemHealth(): Promise<void> {
    try {
      const [healthResponse, busResponse, lifecycleResponse] = await Promise.all([
        this.sendMessageToBackground({ type: 'GET_SYSTEM_HEALTH' }),
        this.sendMessageToBackground({ type: 'GET_MESSAGE_BUS_STATUS' }),
        this.sendMessageToBackground({ type: 'GET_LIFECYCLE_STATUS' })
      ]);
      
      if (healthResponse.success) {
        this.systemHealth = healthResponse.data;
        
        // Add message bus metrics to system health
        if (busResponse.success && this.systemHealth) {
          this.systemHealth = {
            ...this.systemHealth,
            messageBus: busResponse.data as MessageBusStatus
          };
        }

        // Add lifecycle metrics to system health
        if (lifecycleResponse.success && this.systemHealth) {
          (this.systemHealth as any).lifecycle = lifecycleResponse.data;
        }
        
        console.log('[AccessiAI] System health loaded:', this.systemHealth);
      } else {
        throw new Error(healthResponse.error?.message || 'Failed to load system health');
      }
      
    } catch (error) {
      console.error('[AccessiAI] Failed to load system health:', error);
      this.showError('Unable to connect to AccessiAI system');
    }
  }

  private async loadCurrentPageAnalysis(): Promise<void> {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      
      // Request page analysis
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'GET_PAGE_ANALYSIS'
      });
      
      if (response?.success) {
        this.renderPageAnalysis(response.data);
      }
      
    } catch (error) {
      console.log('[AccessiAI] No content script available on current page');
      this.showContentScriptWarning();
    }
  }

  // ============================================================================
  // UI RENDERING
  // ============================================================================

  private renderUI(): void {
    const container = document.getElementById('popup-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="popup-header">
        <div class="logo">
          <img src="icons/icon-64.png" alt="AccessiAI" width="24" height="24">
          <h1>AccessiAI</h1>
        </div>
        <div class="status-indicator ${this.getStatusClass()}">
          ${this.getStatusText()}
        </div>
      </div>
      
      <div class="popup-content">
        ${this.renderSystemStatus()}
        ${this.renderQuickActions()}
        ${this.renderAgentStatus()}
      </div>
      
      <div class="popup-footer">
        <button id="settings-btn" class="secondary-btn">Settings</button>
        <button id="analyze-btn" class="primary-btn">Analyze Page</button>
      </div>
    `;
    
    // Re-attach event listeners after rendering
    this.attachUIEventListeners();
  }

  private renderSystemStatus(): string {
    if (!this.systemHealth) {
      return '<div class="loading">Loading system status...</div>';
    }
    
    const { overallStatus, performance, resources } = this.systemHealth;
    const messageBus = this.systemHealth.messageBus;
    
    return `
      <div class="system-status">
        <h2>System Status</h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">Status</span>
            <span class="value status-${overallStatus}">${overallStatus}</span>
          </div>
          <div class="status-item">
            <span class="label">Response Time</span>
            <span class="value">${Math.round(performance.averageResponseTime)}ms</span>
          </div>
          <div class="status-item">
            <span class="label">Memory Usage</span>
            <span class="value">${Math.round(resources.memoryUsage)}MB</span>
          </div>
          <div class="status-item">
            <span class="label">Uptime</span>
            <span class="value">${this.formatUptime(performance.uptime)}</span>
          </div>
        </div>
        ${messageBus ? this.renderMessageBusStatus(messageBus) : ''}
        ${(this.systemHealth as any).lifecycle ? this.renderLifecycleStatus((this.systemHealth as any).lifecycle) : ''}
      </div>
    `;
  }

  private renderMessageBusStatus(messageBus: MessageBusStatus): string {
    const { metrics, queueStatus } = messageBus;
    
    return `
      <div class="message-bus-status">
        <h3>Message Bus</h3>
        <div class="bus-metrics">
          <div class="metric-item">
            <span class="label">Throughput</span>
            <span class="value">${Math.round(metrics.throughput)} msg/s</span>
          </div>
          <div class="metric-item">
            <span class="label">Queue Size</span>
            <span class="value">${queueStatus.size}</span>
          </div>
          <div class="metric-item">
            <span class="label">Error Rate</span>
            <span class="value">${(metrics.errorRate * 100).toFixed(1)}%</span>
          </div>
          <div class="metric-item">
            <span class="label">Processing</span>
            <span class="value status-${queueStatus.processing ? 'active' : 'idle'}">
              ${queueStatus.processing ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  private renderLifecycleStatus(lifecycle: any): string {
    const { metrics, agentRegistry } = lifecycle;
    
    return `
      <div class="lifecycle-status">
        <h3>Agent Lifecycle</h3>
        <div class="lifecycle-metrics">
          <div class="metric-item">
            <span class="label">Total Agents</span>
            <span class="value">${metrics.totalAgents}</span>
          </div>
          <div class="metric-item">
            <span class="label">Active Agents</span>
            <span class="value">${metrics.activeAgents}</span>
          </div>
          <div class="metric-item">
            <span class="label">Failed Agents</span>
            <span class="value">${metrics.failedAgents}</span>
          </div>
          <div class="metric-item">
            <span class="label">Restarts</span>
            <span class="value">${metrics.restartCount}</span>
          </div>
        </div>
        ${agentRegistry.length > 0 ? this.renderAgentRegistry(agentRegistry) : ''}
      </div>
    `;
  }

  private renderAgentRegistry(agentRegistry: any[]): string {
    const agentRows = agentRegistry.map(agent => `
      <div class="agent-registry-row">
        <span class="agent-name">${agent.name}</span>
        <span class="agent-status status-${agent.status}">${agent.status}</span>
        <span class="restart-count">${agent.restartCount} restarts</span>
      </div>
    `).join('');

    return `
      <div class="agent-registry">
        <h4>Registered Agents</h4>
        <div class="agent-registry-list">
          ${agentRows}
        </div>
      </div>
    `;
  }

  private renderQuickActions(): string {
    return `
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button id="scan-page-btn" class="action-btn">
            <span class="icon">🔍</span>
            <span class="text">Scan Page</span>
          </button>
          <button id="fix-issues-btn" class="action-btn">
            <span class="icon">🔧</span>
            <span class="text">Auto Fix</span>
          </button>
          <button id="toggle-panel-btn" class="action-btn">
            <span class="icon">📋</span>
            <span class="text">Show Panel</span>
          </button>
          <button id="export-report-btn" class="action-btn">
            <span class="icon">📄</span>
            <span class="text">Export Report</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderAgentStatus(): string {
    if (!this.systemHealth?.agents) {
      return '';
    }
    
    const agentRows = this.systemHealth.agents.map(agent => `
      <div class="agent-row">
        <div class="agent-info">
          <span class="agent-name">${this.formatAgentName(agent.agentId)}</span>
          <span class="agent-status status-${agent.status}">${agent.status}</span>
        </div>
        <div class="agent-metrics">
          <span class="metric">${Math.round(agent.responseTime)}ms</span>
          <span class="metric">${Math.round(agent.memoryUsage)}MB</span>
        </div>
      </div>
    `).join('');
    
    return `
      <div class="agent-status">
        <h2>Agent Status</h2>
        <div class="agent-list">
          ${agentRows}
        </div>
      </div>
    `;
  }

  private renderPageAnalysis(analysis: any): void {
    const container = document.getElementById('page-analysis');
    if (!container) return;
    
    container.innerHTML = `
      <div class="page-analysis">
        <h2>Current Page</h2>
        <div class="analysis-summary">
          <div class="score-circle">
            <span class="score">${Math.round(analysis.complianceScore || 0)}</span>
            <span class="label">Score</span>
          </div>
          <div class="issue-count">
            <span class="count">${analysis.issues?.length || 0}</span>
            <span class="label">Issues Found</span>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  private setupEventListeners(): void {
    // Window events
    window.addEventListener('load', () => {
      this.loadCurrentPageAnalysis();
    });
    
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  private attachUIEventListeners(): void {
    // Quick action buttons
    document.getElementById('scan-page-btn')?.addEventListener('click', () => {
      this.handleScanPage();
    });
    
    document.getElementById('fix-issues-btn')?.addEventListener('click', () => {
      this.handleAutoFix();
    });
    
    document.getElementById('toggle-panel-btn')?.addEventListener('click', () => {
      this.handleTogglePanel();
    });
    
    document.getElementById('export-report-btn')?.addEventListener('click', () => {
      this.handleExportReport();
    });
    
    // Footer buttons
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.handleOpenSettings();
    });
    
    document.getElementById('analyze-btn')?.addEventListener('click', () => {
      this.handleAnalyzePage();
    });
  }

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  private async handleScanPage(): Promise<void> {
    try {
      this.showLoading('Scanning page...');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        this.showError('No active tab found');
        return;
      }
      
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' });
        setTimeout(() => {
          this.loadCurrentPageAnalysis();
          this.hideLoading();
        }, 2000);
      } catch (tabError) {
        console.warn('[AccessiAI] Content script not available:', tabError);
        this.showError('Please refresh the page and try again');
      }
      
    } catch (error) {
      console.error('[AccessiAI] Scan page failed:', error);
      this.showError('Failed to scan page');
    }
  }

  private async handleAutoFix(): Promise<void> {
    try {
      this.showLoading('Applying fixes...');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      
      await chrome.tabs.sendMessage(tab.id, { type: 'APPLY_AUTO_FIXES' });
      
      this.hideLoading();
      this.showSuccess('Accessibility fixes applied');
      
    } catch (error) {
      console.error('[AccessiAI] Auto fix failed:', error);
      this.showError('Failed to apply fixes');
    }
  }

  private async handleTogglePanel(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_ACCESSIBILITY_PANEL' });
      
    } catch (error) {
      console.error('[AccessiAI] Toggle panel failed:', error);
      this.showError('Failed to toggle panel');
    }
  }

  private handleExportReport(): void {
    // Exports accessibility analysis results as downloadable report
    this.showInfo('Export feature coming soon');
  }

  private handleOpenSettings(): void {
    chrome.runtime.openOptionsPage();
  }

  private handleAnalyzePage(): void {
    this.handleScanPage();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getStatusClass(): string {
    if (!this.systemHealth) return 'unknown';
    return this.systemHealth.overallStatus;
  }

  private getStatusText(): string {
    if (!this.systemHealth) return 'Loading...';
    return this.systemHealth.overallStatus.charAt(0).toUpperCase() + 
           this.systemHealth.overallStatus.slice(1);
  }

  private formatAgentName(agentId: string): string {
    return agentId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadSystemHealth().then(() => {
        this.renderUI();
      });
    }, 5000); // Refresh every 5 seconds
  }

  private async sendMessageToBackground(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('[AccessiAI] Runtime error:', chrome.runtime.lastError.message);
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!response) {
            reject(new Error('No response from background script'));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // ============================================================================
  // UI FEEDBACK
  // ============================================================================

  private showLoading(message: string): void {
    this.showNotification(message, 'loading');
  }

  private hideLoading(): void {
    const notification = document.querySelector('.notification');
    if (notification) {
      notification.remove();
    }
  }

  private showError(message: string): void {
    this.showNotification(message, 'error');
  }

  private showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  private showInfo(message: string): void {
    this.showNotification(message, 'info');
  }

  private showNotification(message: string, type: string): void {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    if (type !== 'loading') {
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  }

  private showContentScriptWarning(): void {
    const container = document.getElementById('page-analysis');
    if (!container) return;
    
    container.innerHTML = `
      <div class="warning">
        <p>AccessiAI is not active on this page.</p>
        <p>Try refreshing the page or navigate to a website.</p>
      </div>
    `;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  private cleanup(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    
    console.log('[AccessiAI] Popup cleaned up');
  }
}

// ============================================================================
// POPUP HTML STRUCTURE
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Set up basic HTML structure
  document.body.innerHTML = `
    <div id="popup-container" class="popup-container">
      <div class="loading">Loading AccessiAI...</div>
    </div>
    <div id="page-analysis"></div>
  `;
  
  // Initialize popup controller
  const popupController = new PopupController();
  popupController.initialize().catch(error => {
    console.error('[AccessiAI] Popup initialization failed:', error);
    document.body.innerHTML = `
      <div class="error">
        <h2>AccessiAI Error</h2>
        <p>Failed to initialize popup interface.</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  });
});

console.log('[AccessiAI] Popup script loaded');