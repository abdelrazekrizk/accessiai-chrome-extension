/**
 * AccessibilityPanel.ts
 * 
 * Main Accessibility Panel Interface for AccessiAI Chrome Extension
 * Implements floating accessibility panel with:
 * - Drag functionality for repositioning
 * - Issue list display with severity categorization and filtering
 * - Real-time issue updates with live scanning capabilities
 * - Interactive issue details and suggested fixes
 * 
 * Performance Target: <50ms UI updates
 * Accessibility: WCAG 2.1 AA compliant interface
 * 
 * @version 2.0.0
 * @author AccessiAI Team
 */

import { 
  AccessibilityIssue,
  IssueSeverity,
  AccessibilityIssueType
} from '../types/index';

/**
 * Filter settings for accessibility issues
 */
export interface FilterSettings {
  readonly severity: IssueSeverity[];
  readonly type: AccessibilityIssueType[];
  readonly showResolved: boolean;
  readonly searchText: string;
}

/**
 * Panel position configuration
 */
export interface PanelPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Drag handler for panel repositioning
 */
export interface DragHandler {
  readonly isDragging: boolean;
  readonly startPosition: { x: number; y: number };
  readonly currentPosition: { x: number; y: number };
}

/**
 * AccessibilityPanel - Main floating accessibility panel interface
 * 
 * Provides comprehensive accessibility issue management with real-time updates,
 * filtering, and interactive issue resolution capabilities.
 */
export class AccessibilityPanel {
  private static instance: AccessibilityPanel;
  
  // Core Properties
  private panelElement: HTMLElement | null = null;
  private issueList: AccessibilityIssue[] = [];
  private filteredIssues: AccessibilityIssue[] = [];
  private filterSettings: FilterSettings;
  private dragHandler: DragHandler;
  private panelPosition: PanelPosition;
  
  // UI Elements
  private headerElement: HTMLElement | null = null;
  private issueListElement: HTMLElement | null = null;
  private filterElement: HTMLElement | null = null;
  private statsElement: HTMLElement | null = null;
  
  // State Management
  private isVisible: boolean = false;
  private isMinimized: boolean = false;
  private isInitialized: boolean = false;
  
  // Performance Tracking
  private readonly UI_UPDATE_TARGET = 50; // milliseconds
  private updateCount: number = 0;
  private totalUpdateTime: number = 0;
  
  // Event Listeners
  private boundEventListeners: Map<string, EventListener> = new Map();
  
  /**
   * Get singleton instance of AccessibilityPanel
   */
  static getInstance(): AccessibilityPanel {
    if (!AccessibilityPanel.instance) {
      AccessibilityPanel.instance = new AccessibilityPanel();
    }
    return AccessibilityPanel.instance;
  }
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    console.log('[AccessibilityPanel] Initializing Accessibility Panel Interface...');
    
    // Initialize default settings
    this.filterSettings = {
      severity: ['critical', 'high', 'medium', 'low'],
      type: [],
      showResolved: false,
      searchText: ''
    };
    
    this.dragHandler = {
      isDragging: false,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    };
    
    this.panelPosition = {
      x: window.innerWidth - 320,
      y: 20,
      width: 300,
      height: 400
    };
  }
  
  /**
   * Initialize and render the accessibility panel
   * 
   * @returns Promise<void>
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[AccessibilityPanel] Panel already initialized');
      return;
    }
    
    try {
      console.log('[AccessibilityPanel] Initializing panel...');
      
      await this.createPanelStructure();
      await this.setupEventListeners();
      await this.loadUserPreferences();
      
      this.isInitialized = true;
      console.log('[AccessibilityPanel] Panel initialized successfully');
      
    } catch (error) {
      console.error('[AccessibilityPanel] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Render the accessibility panel
   * 
   * @returns Promise<void>
   */
  async render(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const startTime = performance.now();
    
    try {
      console.log('[AccessibilityPanel] Rendering panel...');
      
      if (!this.panelElement) {
        throw new Error('Panel element not created');
      }
      
      // Update panel visibility
      this.panelElement.style.display = this.isVisible ? 'block' : 'none';
      
      // Update panel position
      this.updatePanelPosition();
      
      // Render components
      await this.renderHeader();
      await this.renderStats();
      await this.renderFilters();
      await this.renderIssueList();
      
      const renderTime = performance.now() - startTime;
      this.recordUpdateMetrics(renderTime);
      
      console.log(`[AccessibilityPanel] Panel rendered in ${renderTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('[AccessibilityPanel] Render failed:', error);
      throw error;
    }
  }
  
  /**
   * Update issues displayed in the panel
   * 
   * @param issues - Array of accessibility issues
   * @returns Promise<void>
   */
  async updateIssues(issues: AccessibilityIssue[]): Promise<void> {
    const startTime = performance.now();
    
    try {
      console.log(`[AccessibilityPanel] Updating ${issues.length} issues...`);
      
      this.issueList = [...issues];
      this.applyCurrentFilters();
      
      if (this.isVisible) {
        await this.renderStats();
        await this.renderIssueList();
      }
      
      const updateTime = performance.now() - startTime;
      this.recordUpdateMetrics(updateTime);
      
      console.log(`[AccessibilityPanel] Issues updated in ${updateTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('[AccessibilityPanel] Issue update failed:', error);
      throw error;
    }
  }
  
  /**
   * Show detailed information for a specific issue
   * 
   * @param issue - Accessibility issue to show details for
   * @returns Promise<void>
   */
  async showIssueDetails(issue: AccessibilityIssue): Promise<void> {
    try {
      console.log(`[AccessibilityPanel] Showing details for issue: ${issue.id}`);
      
      // Create or update issue details modal
      const detailsModal = this.createIssueDetailsModal(issue);
      document.body.appendChild(detailsModal);
      
      // Focus management for accessibility
      const firstFocusable = detailsModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
      
    } catch (error) {
      console.error('[AccessibilityPanel] Show issue details failed:', error);
      throw error;
    }
  }
  
  /**
   * Apply filter settings to issue list
   * 
   * @param filter - Filter settings to apply
   * @returns Promise<void>
   */
  async applyFilter(filter: FilterSettings): Promise<void> {
    try {
      console.log('[AccessibilityPanel] Applying filters...');
      
      this.filterSettings = { ...filter };
      this.applyCurrentFilters();
      
      if (this.isVisible) {
        await this.renderStats();
        await this.renderIssueList();
      }
      
    } catch (error) {
      console.error('[AccessibilityPanel] Filter application failed:', error);
      throw error;
    }
  }
  
  /**
   * Show the accessibility panel
   * 
   * @returns Promise<void>
   */
  async show(): Promise<void> {
    try {
      this.isVisible = true;
      await this.render();
      
      // Announce to screen readers
      this.announceToScreenReader('Accessibility panel opened');
      
    } catch (error) {
      console.error('[AccessibilityPanel] Show panel failed:', error);
      throw error;
    }
  }
  
  /**
   * Hide the accessibility panel
   * 
   * @returns Promise<void>
   */
  async hide(): Promise<void> {
    try {
      this.isVisible = false;
      
      if (this.panelElement) {
        this.panelElement.style.display = 'none';
      }
      
      // Announce to screen readers
      this.announceToScreenReader('Accessibility panel closed');
      
    } catch (error) {
      console.error('[AccessibilityPanel] Hide panel failed:', error);
      throw error;
    }
  }
  
  /**
   * Toggle panel visibility
   * 
   * @returns Promise<void>
   */
  async toggle(): Promise<void> {
    if (this.isVisible) {
      await this.hide();
    } else {
      await this.show();
    }
  }
  
  /**
   * Create the main panel structure
   * 
   * @returns Promise<void>
   */
  private async createPanelStructure(): Promise<void> {
    // Create main panel element
    this.panelElement = document.createElement('div');
    this.panelElement.id = 'accessiai-panel';
    this.panelElement.className = 'accessiai-panel';
    this.panelElement.setAttribute('role', 'dialog');
    this.panelElement.setAttribute('aria-label', 'AccessiAI Accessibility Panel');
    this.panelElement.setAttribute('aria-modal', 'false');
    
    // Apply base styles
    this.applyPanelStyles();
    
    // Create header
    this.headerElement = document.createElement('div');
    this.headerElement.className = 'accessiai-panel-header';
    this.headerElement.setAttribute('role', 'banner');
    
    // Create stats section
    this.statsElement = document.createElement('div');
    this.statsElement.className = 'accessiai-panel-stats';
    this.statsElement.setAttribute('role', 'status');
    this.statsElement.setAttribute('aria-live', 'polite');
    
    // Create filter section
    this.filterElement = document.createElement('div');
    this.filterElement.className = 'accessiai-panel-filters';
    this.filterElement.setAttribute('role', 'search');
    
    // Create issue list
    this.issueListElement = document.createElement('div');
    this.issueListElement.className = 'accessiai-panel-issues';
    this.issueListElement.setAttribute('role', 'list');
    this.issueListElement.setAttribute('aria-label', 'Accessibility Issues');
    
    // Assemble panel structure
    this.panelElement.appendChild(this.headerElement);
    this.panelElement.appendChild(this.statsElement);
    this.panelElement.appendChild(this.filterElement);
    this.panelElement.appendChild(this.issueListElement);
    
    // Add to document
    document.body.appendChild(this.panelElement);
  }
  
  /**
   * Setup event listeners for panel interactions
   * 
   * @returns Promise<void>
   */
  private async setupEventListeners(): Promise<void> {
    if (!this.panelElement || !this.headerElement) {
      throw new Error('Panel elements not created');
    }
    
    // Drag functionality
    const mouseDownHandler = (event: Event) => this.handleMouseDown(event as MouseEvent);
    const mouseMoveHandler = (event: Event) => this.handleMouseMove(event as MouseEvent);
    const mouseUpHandler = (event: Event) => this.handleMouseUp(event as MouseEvent);
    
    this.headerElement.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    
    // Store bound listeners for cleanup
    this.boundEventListeners.set('mousedown', mouseDownHandler);
    this.boundEventListeners.set('mousemove', mouseMoveHandler);
    this.boundEventListeners.set('mouseup', mouseUpHandler);
    
    // Keyboard navigation
    const keyDownHandler = (event: Event) => this.handleKeyDown(event as KeyboardEvent);
    this.panelElement.addEventListener('keydown', keyDownHandler);
    this.boundEventListeners.set('keydown', keyDownHandler);
    
    // Window resize
    const resizeHandler = this.handleWindowResize.bind(this);
    window.addEventListener('resize', resizeHandler);
    this.boundEventListeners.set('resize', resizeHandler);
  }
  
  /**
   * Render panel header with title and controls
   * 
   * @returns Promise<void>
   */
  private async renderHeader(): Promise<void> {
    if (!this.headerElement) return;
    
    this.headerElement.innerHTML = `
      <div class="accessiai-panel-title">
        <h2>AccessiAI</h2>
        <span class="accessiai-panel-subtitle">Accessibility Assistant</span>
      </div>
      <div class="accessiai-panel-controls">
        <button type="button" class="accessiai-btn accessiai-btn-minimize" aria-label="Minimize panel">
          ${this.isMinimized ? '▲' : '▼'}
        </button>
        <button type="button" class="accessiai-btn accessiai-btn-close" aria-label="Close panel">
          ✕
        </button>
      </div>
    `;
    
    // Add control event listeners
    const minimizeBtn = this.headerElement.querySelector('.accessiai-btn-minimize') as HTMLButtonElement;
    const closeBtn = this.headerElement.querySelector('.accessiai-btn-close') as HTMLButtonElement;
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', this.handleMinimizeClick.bind(this));
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', this.handleCloseClick.bind(this));
    }
  }
  
  /**
   * Render statistics section
   * 
   * @returns Promise<void>
   */
  private async renderStats(): Promise<void> {
    if (!this.statsElement) return;
    
    const totalIssues = this.issueList.length;
    const filteredCount = this.filteredIssues.length;
    const criticalCount = this.filteredIssues.filter(issue => issue.severity === 'critical').length;
    const highCount = this.filteredIssues.filter(issue => issue.severity === 'high').length;
    
    this.statsElement.innerHTML = `
      <div class="accessiai-stats-summary">
        <span class="accessiai-stats-total">${filteredCount} of ${totalIssues} issues</span>
      </div>
      <div class="accessiai-stats-breakdown">
        <span class="accessiai-stats-critical" title="Critical Issues">${criticalCount}</span>
        <span class="accessiai-stats-high" title="High Priority Issues">${highCount}</span>
      </div>
    `;
  }
  
  /**
   * Render filter controls
   * 
   * @returns Promise<void>
   */
  private async renderFilters(): Promise<void> {
    if (!this.filterElement) return;
    
    this.filterElement.innerHTML = `
      <div class="accessiai-filter-search">
        <input type="text" 
               class="accessiai-search-input" 
               placeholder="Search issues..." 
               value="${this.filterSettings.searchText}"
               aria-label="Search accessibility issues">
      </div>
      <div class="accessiai-filter-severity">
        <label class="accessiai-filter-label">Severity:</label>
        <div class="accessiai-filter-checkboxes">
          ${['critical', 'high', 'medium', 'low'].map(severity => `
            <label class="accessiai-checkbox-label">
              <input type="checkbox" 
                     value="${severity}" 
                     ${this.filterSettings.severity.includes(severity as IssueSeverity) ? 'checked' : ''}
                     class="accessiai-severity-filter">
              <span class="accessiai-severity-${severity}">${severity}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add filter event listeners
    const searchInput = this.filterElement.querySelector('.accessiai-search-input') as HTMLInputElement;
    const severityCheckboxes = this.filterElement.querySelectorAll('.accessiai-severity-filter') as NodeListOf<HTMLInputElement>;
    
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearchInput.bind(this));
    }
    
    severityCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', this.handleSeverityFilterChange.bind(this));
    });
  }
  
  /**
   * Render issue list
   * 
   * @returns Promise<void>
   */
  private async renderIssueList(): Promise<void> {
    if (!this.issueListElement) return;
    
    if (this.filteredIssues.length === 0) {
      this.issueListElement.innerHTML = `
        <div class="accessiai-no-issues">
          <p>No accessibility issues found matching current filters.</p>
        </div>
      `;
      return;
    }
    
    this.issueListElement.innerHTML = this.filteredIssues.map(issue => `
      <div class="accessiai-issue-item" 
           data-issue-id="${issue.id}" 
           role="listitem"
           tabindex="0"
           aria-describedby="issue-${issue.id}-desc">
        <div class="accessiai-issue-header">
          <span class="accessiai-issue-severity accessiai-severity-${issue.severity}" 
                aria-label="Severity: ${issue.severity}">
            ${this.getSeverityIcon(issue.severity)}
          </span>
          <span class="accessiai-issue-type">${this.formatIssueType(issue.type)}</span>
        </div>
        <div class="accessiai-issue-content">
          <p class="accessiai-issue-description" id="issue-${issue.id}-desc">
            ${issue.description}
          </p>
          <div class="accessiai-issue-element">
            <code>${issue.element.tagName}${issue.element.id ? '#' + issue.element.id : ''}${issue.element.className ? '.' + issue.element.className.split(' ').join('.') : ''}</code>
          </div>
        </div>
        <div class="accessiai-issue-actions">
          <button type="button" 
                  class="accessiai-btn accessiai-btn-details" 
                  data-issue-id="${issue.id}"
                  aria-label="View details for ${this.formatIssueType(issue.type)} issue">
            Details
          </button>
        </div>
      </div>
    `).join('');
    
    // Add issue event listeners
    const issueItems = this.issueListElement.querySelectorAll('.accessiai-issue-item');
    const detailButtons = this.issueListElement.querySelectorAll('.accessiai-btn-details');
    
    issueItems.forEach(item => {
      item.addEventListener('click', this.handleIssueClick.bind(this));
      item.addEventListener('keydown', (event: Event) => this.handleIssueKeyDown(event as KeyboardEvent));
    });
    
    detailButtons.forEach(button => {
      button.addEventListener('click', this.handleDetailsClick.bind(this));
    });
  }
  
  /**
   * Apply current filter settings to issue list
   */
  private applyCurrentFilters(): void {
    this.filteredIssues = this.issueList.filter(issue => {
      // Severity filter
      if (!this.filterSettings.severity.includes(issue.severity)) {
        return false;
      }
      
      // Type filter (if any types are selected)
      if (this.filterSettings.type.length > 0 && !this.filterSettings.type.includes(issue.type)) {
        return false;
      }
      
      // Search text filter
      if (this.filterSettings.searchText) {
        const searchText = this.filterSettings.searchText.toLowerCase();
        const matchesDescription = issue.description.toLowerCase().includes(searchText);
        const matchesType = issue.type.toLowerCase().includes(searchText);
        const matchesElement = issue.element.tagName.toLowerCase().includes(searchText);
        
        if (!matchesDescription && !matchesType && !matchesElement) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Create issue details modal
   * 
   * @param issue - Accessibility issue
   * @returns HTMLElement - Modal element
   */
  private createIssueDetailsModal(issue: AccessibilityIssue): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'accessiai-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    modal.innerHTML = `
      <div class="accessiai-modal-content">
        <div class="accessiai-modal-header">
          <h3 id="modal-title">${this.formatIssueType(issue.type)} Issue</h3>
          <button type="button" class="accessiai-btn accessiai-btn-close" aria-label="Close details">✕</button>
        </div>
        <div class="accessiai-modal-body">
          <div class="accessiai-issue-detail-section">
            <h4>Description</h4>
            <p>${issue.description}</p>
          </div>
          <div class="accessiai-issue-detail-section">
            <h4>Severity</h4>
            <span class="accessiai-severity-${issue.severity}">${issue.severity.toUpperCase()}</span>
          </div>
          <div class="accessiai-issue-detail-section">
            <h4>Element</h4>
            <code>${issue.element.xpath}</code>
          </div>
          <div class="accessiai-issue-detail-section">
            <h4>Suggested Fix</h4>
            <p>${issue.suggestedFix}</p>
          </div>
          <div class="accessiai-issue-detail-section">
            <h4>WCAG Criteria</h4>
            <p>${issue.wcagCriteria.join(', ')}</p>
          </div>
        </div>
        <div class="accessiai-modal-footer">
          <button type="button" class="accessiai-btn accessiai-btn-primary">Apply Fix</button>
          <button type="button" class="accessiai-btn accessiai-btn-secondary">Ignore Issue</button>
        </div>
      </div>
    `;
    
    // Add modal event listeners
    const closeBtn = modal.querySelector('.accessiai-btn-close') as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Close on Escape key
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.body.removeChild(modal);
      }
    });
    
    return modal;
  }
  
  // Event Handlers
  
  private handleMouseDown(event: MouseEvent): void {
    if (!this.headerElement?.contains(event.target as Node)) return;
    
    this.dragHandler = {
      isDragging: true,
      startPosition: { x: event.clientX, y: event.clientY },
      currentPosition: { x: this.panelPosition.x, y: this.panelPosition.y }
    };
    
    event.preventDefault();
  }
  
  private handleMouseMove(event: MouseEvent): void {
    if (!this.dragHandler.isDragging) return;
    
    const deltaX = event.clientX - this.dragHandler.startPosition.x;
    const deltaY = event.clientY - this.dragHandler.startPosition.y;
    
    this.panelPosition = {
      ...this.panelPosition,
      x: Math.max(0, Math.min(window.innerWidth - this.panelPosition.width, this.dragHandler.currentPosition.x + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - this.panelPosition.height, this.dragHandler.currentPosition.y + deltaY))
    };
    
    this.updatePanelPosition();
  }
  
  private handleMouseUp(_event: MouseEvent): void {
    this.dragHandler = {
      ...this.dragHandler,
      isDragging: false
    };
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    // Handle keyboard navigation
    if (event.key === 'Escape') {
      this.hide();
    }
  }
  
  private handleIssueClick(event: Event): void {
    const issueItem = (event.currentTarget as HTMLElement);
    const issueId = issueItem.dataset['issueId'];
    
    if (issueId) {
      const issue = this.issueList.find(i => i.id === issueId);
      if (issue) {
        this.showIssueDetails(issue);
      }
    }
  }
  
  private handleIssueKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleIssueClick(event);
    }
  }
  
  private handleDetailsClick(event: Event): void {
    event.stopPropagation();
    const button = event.currentTarget as HTMLButtonElement;
    const issueId = button.dataset['issueId'];
    
    if (issueId) {
      const issue = this.issueList.find(i => i.id === issueId);
      if (issue) {
        this.showIssueDetails(issue);
      }
    }
  }
  
  private handleMinimizeClick(): void {
    this.isMinimized = !this.isMinimized;
    this.render();
  }
  
  private handleCloseClick(): void {
    this.hide();
  }
  
  private handleSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterSettings = {
      ...this.filterSettings,
      searchText: input.value
    };
    this.applyCurrentFilters();
    this.renderStats();
    this.renderIssueList();
  }
  
  private handleSeverityFilterChange(): void {
    if (!this.filterElement) return;
    
    const checkboxes = this.filterElement.querySelectorAll('.accessiai-severity-filter:checked') as NodeListOf<HTMLInputElement>;
    const selectedSeverities = Array.from(checkboxes).map(cb => cb.value as IssueSeverity);
    
    this.filterSettings = {
      ...this.filterSettings,
      severity: selectedSeverities
    };
    
    this.applyCurrentFilters();
    this.renderStats();
    this.renderIssueList();
  }
  
  private handleWindowResize(): void {
    // Ensure panel stays within viewport
    this.panelPosition = {
      ...this.panelPosition,
      x: Math.min(this.panelPosition.x, window.innerWidth - this.panelPosition.width),
      y: Math.min(this.panelPosition.y, window.innerHeight - this.panelPosition.height)
    };
    this.updatePanelPosition();
  }
  
  // Utility Methods
  
  private updatePanelPosition(): void {
    if (!this.panelElement) return;
    
    this.panelElement.style.left = `${this.panelPosition.x}px`;
    this.panelElement.style.top = `${this.panelPosition.y}px`;
    this.panelElement.style.width = `${this.panelPosition.width}px`;
    this.panelElement.style.height = `${this.panelPosition.height}px`;
  }
  
  private applyPanelStyles(): void {
    if (!this.panelElement) return;
    
    // Apply CSS styles programmatically
    Object.assign(this.panelElement.style, {
      position: 'fixed',
      zIndex: '10000',
      backgroundColor: '#ffffff',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      overflow: 'hidden'
    });
  }
  
  private getSeverityIcon(severity: IssueSeverity): string {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };
    return icons[severity] || '⚪';
  }
  
  private formatIssueType(type: AccessibilityIssueType): string {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  private async loadUserPreferences(): Promise<void> {
    // Load user preferences from storage
    // This would integrate with StorageManager
    console.log('[AccessibilityPanel] Loading user preferences...');
  }
  
  private recordUpdateMetrics(updateTime: number): void {
    this.updateCount++;
    this.totalUpdateTime += updateTime;
    
    const averageTime = this.totalUpdateTime / this.updateCount;
    
    if (updateTime > this.UI_UPDATE_TARGET) {
      console.warn(`[AccessibilityPanel] UI update time ${updateTime.toFixed(2)}ms exceeded target ${this.UI_UPDATE_TARGET}ms`);
    }
    
    console.log(`[AccessibilityPanel] Average UI update time: ${averageTime.toFixed(2)}ms`);
  }
  
  /**
   * Cleanup resources and event listeners
   */
  async shutdown(): Promise<void> {
    try {
      console.log('[AccessibilityPanel] Shutting down...');
      
      // Remove event listeners
      this.boundEventListeners.forEach((listener, event) => {
        if (event === 'resize') {
          window.removeEventListener(event, listener);
        } else if (this.panelElement) {
          this.panelElement.removeEventListener(event, listener);
        }
      });
      
      // Remove panel from DOM
      if (this.panelElement && this.panelElement.parentNode) {
        this.panelElement.parentNode.removeChild(this.panelElement);
      }
      
      // Reset state
      this.isInitialized = false;
      this.isVisible = false;
      
      console.log('[AccessibilityPanel] Shutdown complete');
      
    } catch (error) {
      console.error('[AccessibilityPanel] Shutdown failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const accessibilityPanel = AccessibilityPanel.getInstance();
export default accessibilityPanel;