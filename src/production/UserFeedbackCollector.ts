/**
 * User Feedback Collector - Task 17: Status and Feedback System
 * User feedback collection with accessibility compliance
 * Following Integration Phase Template System - Phase 3: Placeholder Implementation
 */

import type {
  UserFeedbackCollector as IUserFeedbackCollector,
  UserFeedback,
  FeedbackContext,
  FeedbackSubmissionResult,
  FeedbackFormConfig,
  FeedbackType,
  FeedbackCategory,
  FeedbackSeverity,
  FeedbackExportFormat,
  ProductionComponentStatus,
  ProductionComponentMetrics
} from '../types/production';

// ============================================================================
// USER FEEDBACK COLLECTOR IMPLEMENTATION
// ============================================================================

export class UserFeedbackCollector implements IUserFeedbackCollector {
  // ============================================================================
  // SINGLETON PATTERN (Following AccessiAI Roadmap)
  // ============================================================================

  private static instance: UserFeedbackCollector;
  
  static getInstance(): UserFeedbackCollector {
    if (!UserFeedbackCollector.instance) {
      UserFeedbackCollector.instance = new UserFeedbackCollector();
    }
    return UserFeedbackCollector.instance;
  }

  // ============================================================================
  // CORE PROPERTIES (Following Roadmap Variable Naming)
  // ============================================================================

  private feedbackHistory: UserFeedback[] = [];
  private feedbackForm: HTMLElement | null = null;
  private isFormVisible: boolean = false;
  private config: FeedbackFormConfig;
  private isInitialized: boolean = false;
  private operationCount: number = 0;
  private errorCount: number = 0;
  private lastOperationTime: number = 0;
  private initializationTime: number = 0;

  private constructor() {
    console.log('[UserFeedbackCollector] Initialized for Task 17');
    
    // Default configuration following roadmap patterns
    this.config = {
      enableScreenshots: true,
      enableLogAttachment: true,
      enableSystemInfo: true,
      requiredFields: ['title', 'description', 'category'],
      maxAttachmentSize: 5 * 1024 * 1024, // 5MB
      maxAttachments: 3
    };
  }

  // ============================================================================
  // INITIALIZATION AND LIFECYCLE (Following Template Pattern)
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('[UserFeedbackCollector] Already initialized');
        return;
      }

      console.log('[UserFeedbackCollector] Initializing user feedback collector...');
      this.initializationTime = Date.now();

      // Create feedback form elements
      await this.createFeedbackForm();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load existing feedback history
      await this.loadFeedbackHistory();

      this.isInitialized = true;
      console.log('[UserFeedbackCollector] User feedback collector initialized successfully');

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to initialize:', error);
      this.errorCount++;
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      console.log('[UserFeedbackCollector] Shutting down user feedback collector...');

      // Hide feedback form if visible
      if (this.isFormVisible) {
        await this.hideFeedbackForm();
      }

      // Save feedback history
      await this.saveFeedbackHistory();

      // Remove event listeners
      this.removeEventListeners();

      // Remove DOM elements
      this.removeFeedbackForm();

      // Reset state
      this.isFormVisible = false;
      this.isInitialized = false;

      console.log('[UserFeedbackCollector] User feedback collector shutdown complete');

    } catch (error) {
      console.error('[UserFeedbackCollector] Error during shutdown:', error);
      this.errorCount++;
      throw error;
    }
  }

  // ============================================================================
  // FEEDBACK COLLECTION METHODS (Following Interface Design)
  // ============================================================================

  async showFeedbackForm(context?: FeedbackContext): Promise<void> {
    try {
      console.log('[UserFeedbackCollector] Showing feedback form');
      this.operationCount++;
      this.lastOperationTime = Date.now();

      if (!this.feedbackForm) {
        await this.createFeedbackForm();
      }

      // Populate form with context if provided
      if (context) {
        this.populateFormWithContext(context);
      }

      // Show form with accessibility focus
      this.feedbackForm!.style.display = 'block';
      this.feedbackForm!.setAttribute('aria-hidden', 'false');
      
      // Focus first form element for accessibility
      const firstInput = this.feedbackForm!.querySelector('input, textarea, select') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }

      this.isFormVisible = true;
      console.log('[UserFeedbackCollector] Feedback form shown successfully');

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to show feedback form:', error);
      this.errorCount++;
      throw error;
    }
  }

  async collectFeedback(feedback: UserFeedback): Promise<FeedbackSubmissionResult> {
    try {
      console.log(`[UserFeedbackCollector] Collecting feedback: ${feedback.type}`);
      this.operationCount++;
      this.lastOperationTime = Date.now();

      // Validate feedback
      const validationResult = this.validateFeedback(feedback);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error || 'Validation failed',
          timestamp: Date.now()
        };
      }

      // Add to history
      this.feedbackHistory.push(feedback);

      // Save to storage
      await this.saveFeedbackHistory();

      // Hide form after successful submission
      if (this.isFormVisible) {
        await this.hideFeedbackForm();
      }

      console.log(`[UserFeedbackCollector] Feedback collected successfully: ${feedback.id}`);

      return {
        success: true,
        feedbackId: feedback.id,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to collect feedback:', error);
      this.errorCount++;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async getFeedbackHistory(): Promise<UserFeedback[]> {
    try {
      console.log('[UserFeedbackCollector] Retrieving feedback history');
      this.operationCount++;
      this.lastOperationTime = Date.now();

      return [...this.feedbackHistory]; // Return copy to prevent mutation

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to get feedback history:', error);
      this.errorCount++;
      throw error;
    }
  }

  async exportFeedback(format: FeedbackExportFormat): Promise<string> {
    try {
      console.log(`[UserFeedbackCollector] Exporting feedback as ${format}`);
      this.operationCount++;
      this.lastOperationTime = Date.now();

      switch (format) {
        case 'json':
          return JSON.stringify(this.feedbackHistory, null, 2);
        
        case 'csv':
          return this.exportAsCSV();
        
        case 'html':
          return this.exportAsHTML();
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to export feedback:', error);
      this.errorCount++;
      throw error;
    }
  }

  // ============================================================================
  // COMPONENT LIFECYCLE INTERFACE IMPLEMENTATION
  // ============================================================================

  getStatus(): ProductionComponentStatus {
    return {
      componentId: 'user-feedback-collector',
      name: 'User Feedback Collector',
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

  private async createFeedbackForm(): Promise<void> {
    try {
      console.log('[UserFeedbackCollector] Creating feedback form');

      this.feedbackForm = document.createElement('div');
      this.feedbackForm.id = 'accessiai-feedback-form';
      this.feedbackForm.className = 'accessiai-feedback-container';
      this.feedbackForm.setAttribute('role', 'dialog');
      this.feedbackForm.setAttribute('aria-label', 'AccessiAI Feedback Form');
      this.feedbackForm.setAttribute('aria-modal', 'true');
      this.feedbackForm.style.display = 'none';
      this.feedbackForm.setAttribute('aria-hidden', 'true');

      // Create form HTML with accessibility compliance
      this.feedbackForm.innerHTML = this.generateFormHTML();

      // Add to DOM
      document.body.appendChild(this.feedbackForm);

      console.log('[UserFeedbackCollector] Feedback form created');

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to create feedback form:', error);
      throw error;
    }
  }

  private removeFeedbackForm(): void {
    try {
      if (this.feedbackForm && this.feedbackForm.parentNode) {
        this.feedbackForm.parentNode.removeChild(this.feedbackForm);
      }
      
      this.feedbackForm = null;
      console.log('[UserFeedbackCollector] Feedback form removed');

    } catch (error) {
      console.error('[UserFeedbackCollector] Error removing feedback form:', error);
    }
  }

  private setupEventListeners(): void {
    try {
      console.log('[UserFeedbackCollector] Setting up event listeners');

      // Form submission handler
      if (this.feedbackForm) {
        const form = this.feedbackForm.querySelector('form');
        if (form) {
          form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Close button handler
        const closeButton = this.feedbackForm.querySelector('.close-button');
        if (closeButton) {
          closeButton.addEventListener('click', this.handleCloseForm.bind(this));
        }
      }

      // Keyboard navigation
      document.addEventListener('keydown', this.handleKeyDown.bind(this));

      console.log('[UserFeedbackCollector] Event listeners set up');

    } catch (error) {
      console.error('[UserFeedbackCollector] Error setting up event listeners:', error);
    }
  }

  private removeEventListeners(): void {
    try {
      if (this.feedbackForm) {
        const form = this.feedbackForm.querySelector('form');
        if (form) {
          form.removeEventListener('submit', this.handleFormSubmit.bind(this));
        }

        const closeButton = this.feedbackForm.querySelector('.close-button');
        if (closeButton) {
          closeButton.removeEventListener('click', this.handleCloseForm.bind(this));
        }
      }

      document.removeEventListener('keydown', this.handleKeyDown.bind(this));

      console.log('[UserFeedbackCollector] Event listeners removed');

    } catch (error) {
      console.error('[UserFeedbackCollector] Error removing event listeners:', error);
    }
  }

  private async loadFeedbackHistory(): Promise<void> {
    try {
      // In a full implementation, this would load from IndexedDB
      // For now, initialize with empty array
      this.feedbackHistory = [];
      console.log('[UserFeedbackCollector] Feedback history loaded');

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to load feedback history:', error);
      this.feedbackHistory = [];
    }
  }

  private async saveFeedbackHistory(): Promise<void> {
    try {
      // In a full implementation, this would save to IndexedDB
      console.log(`[UserFeedbackCollector] Feedback history saved (${this.feedbackHistory.length} items)`);

    } catch (error) {
      console.error('[UserFeedbackCollector] Failed to save feedback history:', error);
    }
  }

  private populateFormWithContext(context: FeedbackContext): void {
    try {
      if (!this.feedbackForm) return;

      // Populate context fields
      const pageUrlField = this.feedbackForm.querySelector('#feedback-page-url') as HTMLInputElement;
      if (pageUrlField && context.pageUrl) {
        pageUrlField.value = context.pageUrl;
      }

      const browserVersionField = this.feedbackForm.querySelector('#feedback-browser-version') as HTMLInputElement;
      if (browserVersionField) {
        browserVersionField.value = context.browserVersion;
      }

      console.log('[UserFeedbackCollector] Form populated with context');

    } catch (error) {
      console.error('[UserFeedbackCollector] Error populating form with context:', error);
    }
  }

  private validateFeedback(feedback: UserFeedback): { isValid: boolean; error?: string } {
    try {
      // Validate required fields
      if (!feedback.title || feedback.title.trim().length === 0) {
        return { isValid: false, error: 'Title is required' };
      }

      if (!feedback.description || feedback.description.trim().length === 0) {
        return { isValid: false, error: 'Description is required' };
      }

      if (!feedback.category) {
        return { isValid: false, error: 'Category is required' };
      }

      // Validate attachments
      if (feedback.attachments.length > this.config.maxAttachments) {
        return { isValid: false, error: `Maximum ${this.config.maxAttachments} attachments allowed` };
      }

      for (const attachment of feedback.attachments) {
        if (attachment.size > this.config.maxAttachmentSize) {
          return { isValid: false, error: `Attachment ${attachment.name} exceeds maximum size` };
        }
      }

      return { isValid: true };

    } catch (error) {
      return { isValid: false, error: 'Validation error occurred' };
    }
  }

  private generateFormHTML(): string {
    return `
      <div class="feedback-form-overlay">
        <form class="feedback-form" aria-labelledby="feedback-form-title">
          <div class="feedback-form-header">
            <h2 id="feedback-form-title">AccessiAI Feedback</h2>
            <button type="button" class="close-button" aria-label="Close feedback form">×</button>
          </div>
          
          <div class="feedback-form-body">
            <div class="form-group">
              <label for="feedback-type">Feedback Type *</label>
              <select id="feedback-type" name="type" required aria-describedby="feedback-type-help">
                <option value="">Select type...</option>
                <option value="bug-report">Bug Report</option>
                <option value="feature-request">Feature Request</option>
                <option value="question">Question</option>
                <option value="improvement">Improvement</option>
                <option value="compliment">Compliment</option>
              </select>
              <div id="feedback-type-help" class="form-help">Choose the type of feedback you're providing</div>
            </div>

            <div class="form-group">
              <label for="feedback-category">Category *</label>
              <select id="feedback-category" name="category" required>
                <option value="">Select category...</option>
                <option value="accessibility">Accessibility</option>
                <option value="performance">Performance</option>
                <option value="ui-ux">UI/UX</option>
                <option value="functionality">Functionality</option>
                <option value="compatibility">Compatibility</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="feedback-severity">Severity</label>
              <select id="feedback-severity" name="severity">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div class="form-group">
              <label for="feedback-title">Title *</label>
              <input type="text" id="feedback-title" name="title" required maxlength="100" 
                     aria-describedby="feedback-title-help">
              <div id="feedback-title-help" class="form-help">Brief summary of your feedback</div>
            </div>

            <div class="form-group">
              <label for="feedback-description">Description *</label>
              <textarea id="feedback-description" name="description" required rows="5" 
                        aria-describedby="feedback-description-help"></textarea>
              <div id="feedback-description-help" class="form-help">Detailed description of your feedback</div>
            </div>

            <div class="form-group">
              <label for="feedback-page-url">Page URL</label>
              <input type="url" id="feedback-page-url" name="pageUrl" readonly>
            </div>

            <div class="form-group">
              <label for="feedback-browser-version">Browser Version</label>
              <input type="text" id="feedback-browser-version" name="browserVersion" readonly>
            </div>
          </div>

          <div class="feedback-form-footer">
            <button type="button" class="btn-secondary" onclick="this.closest('.accessiai-feedback-container').style.display='none'">
              Cancel
            </button>
            <button type="submit" class="btn-primary">Submit Feedback</button>
          </div>
        </form>
      </div>
    `;
  }

  private async hideFeedbackForm(): Promise<void> {
    if (this.feedbackForm) {
      this.feedbackForm.style.display = 'none';
      this.feedbackForm.setAttribute('aria-hidden', 'true');
      this.isFormVisible = false;
    }
  }

  private exportAsCSV(): string {
    const headers = ['ID', 'Type', 'Category', 'Severity', 'Title', 'Description', 'Timestamp', 'Status'];
    const rows = this.feedbackHistory.map(feedback => [
      feedback.id,
      feedback.type,
      feedback.category,
      feedback.severity,
      `"${feedback.title.replace(/"/g, '""')}"`,
      `"${feedback.description.replace(/"/g, '""')}"`,
      new Date(feedback.timestamp).toISOString(),
      feedback.status
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private exportAsHTML(): string {
    const feedbackRows = this.feedbackHistory.map(feedback => `
      <tr>
        <td>${feedback.id}</td>
        <td>${feedback.type}</td>
        <td>${feedback.category}</td>
        <td>${feedback.severity}</td>
        <td>${feedback.title}</td>
        <td>${feedback.description}</td>
        <td>${new Date(feedback.timestamp).toLocaleString()}</td>
        <td>${feedback.status}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AccessiAI Feedback Export</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>AccessiAI Feedback Export</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Title</th>
              <th>Description</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${feedbackRows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  private handleFormSubmit(event: Event): void {
    event.preventDefault();
    console.log('[UserFeedbackCollector] Form submitted');
    
    // In a full implementation, this would collect form data and create UserFeedback object
    // For now, just hide the form
    this.hideFeedbackForm();
  }

  private handleCloseForm(): void {
    console.log('[UserFeedbackCollector] Form closed');
    this.hideFeedbackForm();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Handle Escape key to close form
    if (event.key === 'Escape' && this.isFormVisible) {
      event.preventDefault();
      this.hideFeedbackForm();
    }
  }

  // ============================================================================
  // PUBLIC CONFIGURATION METHODS
  // ============================================================================

  updateConfiguration(config: Partial<FeedbackFormConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[UserFeedbackCollector] Configuration updated');
  }

  getFeedbackCount(): number {
    return this.feedbackHistory.length;
  }

  getFeedbackByType(type: FeedbackType): UserFeedback[] {
    return this.feedbackHistory.filter(feedback => feedback.type === type);
  }

  getFeedbackByCategory(category: FeedbackCategory): UserFeedback[] {
    return this.feedbackHistory.filter(feedback => feedback.category === category);
  }

  getFeedbackBySeverity(severity: FeedbackSeverity): UserFeedback[] {
    return this.feedbackHistory.filter(feedback => feedback.severity === severity);
  }
}