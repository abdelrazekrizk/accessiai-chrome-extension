/**
 * AccessiAI Production Types - Task 17: Status and Feedback System
 * Interface definitions for production deployment components
 * Following Integration Phase Template System - Phase 2: Interface Design
 */

import type {
  SystemHealthReport,
  SystemStatus
} from './index';

// ============================================================================
// SYSTEM STATUS DISPLAY INTERFACES
// ============================================================================

export interface SystemStatusDisplay {
  initialize(): Promise<void>;
  updateStatus(healthReport: SystemHealthReport): Promise<void>;
  showStatusIndicator(status: SystemStatus): Promise<void>;
  hideStatusIndicator(): Promise<void>;
  getDisplayState(): StatusDisplayState;
  shutdown(): Promise<void>;
}

export interface StatusDisplayState {
  readonly isVisible: boolean;
  readonly currentStatus: SystemStatus;
  readonly lastUpdate: number;
  readonly displayMode: StatusDisplayMode;
  readonly position: StatusPosition;
}

export type StatusDisplayMode = 'badge' | 'panel' | 'notification' | 'minimal';
export type StatusPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface StatusIndicatorConfig {
  readonly showBadge: boolean;
  readonly showNotifications: boolean;
  readonly autoHide: boolean;
  readonly autoHideDelay: number;
  readonly position: StatusPosition;
  readonly theme: 'light' | 'dark' | 'auto';
}

// ============================================================================
// USER FEEDBACK COLLECTION INTERFACES
// ============================================================================

export interface UserFeedbackCollector {
  initialize(): Promise<void>;
  showFeedbackForm(context?: FeedbackContext): Promise<void>;
  collectFeedback(feedback: UserFeedback): Promise<FeedbackSubmissionResult>;
  getFeedbackHistory(): Promise<UserFeedback[]>;
  exportFeedback(format: FeedbackExportFormat): Promise<string>;
  shutdown(): Promise<void>;
}

export interface UserFeedback {
  readonly id: string;
  readonly type: FeedbackType;
  readonly category: FeedbackCategory;
  readonly title: string;
  readonly description: string;
  readonly severity: FeedbackSeverity;
  readonly context: FeedbackContext;
  readonly attachments: FeedbackAttachment[];
  readonly userAgent: string;
  readonly timestamp: number;
  readonly status: FeedbackStatus;
}

export type FeedbackType = 'bug-report' | 'feature-request' | 'question' | 'improvement' | 'compliment';
export type FeedbackCategory = 'accessibility' | 'performance' | 'ui-ux' | 'functionality' | 'compatibility' | 'other';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus = 'submitted' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed';
export type FeedbackExportFormat = 'json' | 'csv' | 'html';

export interface FeedbackContext {
  readonly pageUrl?: string;
  readonly pageTitle?: string;
  readonly extensionVersion: string;
  readonly browserVersion: string;
  readonly systemInfo: SystemInfo;
  readonly accessibilityIssues?: number;
  readonly lastAnalysisScore?: number;
  readonly activeFeatures: string[];
}

export interface SystemInfo {
  readonly platform: string;
  readonly userAgent: string;
  readonly screenResolution: string;
  readonly colorDepth: number;
  readonly language: string;
  readonly timezone: string;
}

export interface FeedbackAttachment {
  readonly id: string;
  readonly type: AttachmentType;
  readonly name: string;
  readonly size: number;
  readonly data: string; // base64 encoded
  readonly mimeType: string;
  readonly timestamp: number;
}

export type AttachmentType = 'screenshot' | 'log' | 'report' | 'document';

export interface FeedbackSubmissionResult {
  readonly success: boolean;
  readonly feedbackId?: string;
  readonly error?: string;
  readonly timestamp: number;
}

export interface FeedbackFormConfig {
  readonly enableScreenshots: boolean;
  readonly enableLogAttachment: boolean;
  readonly enableSystemInfo: boolean;
  readonly requiredFields: FeedbackFormField[];
  readonly maxAttachmentSize: number; // bytes
  readonly maxAttachments: number;
}

export type FeedbackFormField = 'title' | 'description' | 'category' | 'severity' | 'email';

// ============================================================================
// PROGRESS INDICATOR INTERFACES
// ============================================================================

export interface ProgressIndicatorManager {
  initialize(): Promise<void>;
  createProgress(config: ProgressConfig): Promise<ProgressIndicator>;
  updateProgress(id: string, progress: ProgressUpdate): Promise<void>;
  completeProgress(id: string, result?: ProgressResult): Promise<void>;
  cancelProgress(id: string): Promise<void>;
  getActiveProgress(): Promise<ProgressIndicator[]>;
  shutdown(): Promise<void>;
}

export interface ProgressIndicator {
  readonly id: string;
  readonly title: string;
  readonly type: ProgressType;
  readonly status: ProgressStatus;
  readonly progress: number; // 0-100 for determinate, -1 for indeterminate
  readonly startTime: number;
  readonly estimatedDuration?: number;
  readonly currentStep?: string;
  readonly totalSteps?: number;
  readonly completedSteps?: number;
  readonly canCancel: boolean;
  readonly metadata: Record<string, unknown>;
}

export type ProgressType = 'determinate' | 'indeterminate' | 'stepped';
export type ProgressStatus = 'pending' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error';

export interface ProgressConfig {
  readonly title: string;
  readonly type: ProgressType;
  readonly canCancel: boolean;
  readonly showInBadge: boolean;
  readonly showNotification: boolean;
  readonly estimatedDuration?: number;
  readonly totalSteps?: number;
  readonly metadata?: Record<string, unknown>;
}

export interface ProgressUpdate {
  readonly progress?: number;
  readonly currentStep?: string;
  readonly completedSteps?: number;
  readonly estimatedDuration?: number;
  readonly status?: ProgressStatus;
  readonly metadata?: Record<string, unknown>;
}

export interface ProgressResult {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: unknown;
  readonly error?: string;
  readonly duration: number;
}

export interface ProgressNotificationConfig {
  readonly showStartNotification: boolean;
  readonly showProgressNotification: boolean;
  readonly showCompletionNotification: boolean;
  readonly showErrorNotification: boolean;
  readonly autoHideDelay: number;
  readonly soundEnabled: boolean;
}

// ============================================================================
// PRODUCTION SYSTEM EVENTS
// ============================================================================

export interface ProductionSystemEvent {
  readonly type: ProductionEventType;
  readonly source: string;
  readonly data: unknown;
  readonly timestamp: number;
  readonly correlationId?: string;
}

export type ProductionEventType =
  | 'status-changed'
  | 'feedback-submitted'
  | 'progress-started'
  | 'progress-updated'
  | 'progress-completed'
  | 'progress-cancelled'
  | 'system-alert'
  | 'user-action'
  | 'error-occurred';

// ============================================================================
// INTEGRATION COORDINATOR INTERFACES
// ============================================================================

export interface ProductionIntegrationCoordinator {
  registerStatusDisplay(display: SystemStatusDisplay): Promise<void>;
  registerFeedbackCollector(collector: UserFeedbackCollector): Promise<void>;
  registerProgressManager(manager: ProgressIndicatorManager): Promise<void>;
  
  broadcastStatusUpdate(healthReport: SystemHealthReport): Promise<void>;
  broadcastProgressUpdate(progressId: string, update: ProgressUpdate): Promise<void>;
  broadcastSystemEvent(event: ProductionSystemEvent): Promise<void>;
  
  getSystemStatus(): Promise<SystemHealthReport>;
  getActiveProgress(): Promise<ProgressIndicator[]>;
  getFeedbackSummary(): Promise<FeedbackSummary>;
}

export interface FeedbackSummary {
  readonly totalFeedback: number;
  readonly feedbackByType: Record<FeedbackType, number>;
  readonly feedbackByCategory: Record<FeedbackCategory, number>;
  readonly feedbackBySeverity: Record<FeedbackSeverity, number>;
  readonly averageRating?: number;
  readonly lastFeedbackDate?: number;
}

// ============================================================================
// COMPONENT LIFECYCLE INTERFACES
// ============================================================================

export interface ProductionComponentLifecycle {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): ProductionComponentStatus;
  getMetrics(): ProductionComponentMetrics;
}

export interface ProductionComponentStatus {
  readonly componentId: string;
  readonly name: string;
  readonly status: 'initializing' | 'active' | 'error' | 'offline';
  readonly lastUpdate: number;
  readonly version: string;
}

export interface ProductionComponentMetrics {
  readonly operationCount: number;
  readonly errorCount: number;
  readonly averageResponseTime: number;
  readonly lastOperationTime: number;
  readonly uptime: number;
}

// ============================================================================
// ERROR HANDLING INTERFACES
// ============================================================================

export interface ProductionErrorHandler {
  handleError(error: ProductionError): Promise<void>;
  reportError(error: ProductionError): Promise<void>;
  getErrorHistory(): Promise<ProductionError[]>;
  clearErrors(): Promise<void>;
}

export interface ProductionError {
  readonly id: string;
  readonly type: ProductionErrorType;
  readonly component: string;
  readonly message: string;
  readonly stack?: string;
  readonly context: Record<string, unknown>;
  readonly timestamp: number;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly resolved: boolean;
}

export type ProductionErrorType =
  | 'initialization-error'
  | 'runtime-error'
  | 'communication-error'
  | 'validation-error'
  | 'permission-error'
  | 'resource-error';

// ============================================================================
// ACCESSIBILITY COMPLIANCE INTERFACES
// ============================================================================

export interface AccessibilityComplianceChecker {
  validateComponent(component: HTMLElement): Promise<AccessibilityValidationResult>;
  validateForm(form: HTMLFormElement): Promise<AccessibilityValidationResult>;
  validateInteraction(element: HTMLElement): Promise<AccessibilityValidationResult>;
  generateAccessibilityReport(): Promise<AccessibilityComplianceReport>;
}

export interface AccessibilityValidationResult {
  readonly isCompliant: boolean;
  readonly issues: AccessibilityComplianceIssue[];
  readonly score: number; // 0-100
  readonly recommendations: string[];
}

export interface AccessibilityComplianceIssue {
  readonly type: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly element: string;
  readonly wcagCriteria: string[];
  readonly fix: string;
}

export interface AccessibilityComplianceReport {
  readonly overallScore: number;
  readonly componentScores: Record<string, number>;
  readonly totalIssues: number;
  readonly issuesBySeverity: Record<string, number>;
  readonly recommendations: string[];
  readonly timestamp: number;
}

// ============================================================================
// CONSTANTS AND DEFAULTS
// ============================================================================

export const PRODUCTION_DEFAULTS = {
  STATUS_DISPLAY: {
    AUTO_HIDE_DELAY: 5000,
    POSITION: 'top-right' as StatusPosition,
    THEME: 'auto' as const
  },
  FEEDBACK: {
    MAX_ATTACHMENT_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_ATTACHMENTS: 3,
    AUTO_INCLUDE_SYSTEM_INFO: true
  },
  PROGRESS: {
    AUTO_HIDE_DELAY: 3000,
    SHOW_NOTIFICATIONS: true,
    SOUND_ENABLED: false
  }
} as const;

export const PRODUCTION_PERFORMANCE_TARGETS = {
  STATUS_UPDATE_TIME: 50,      // milliseconds
  FEEDBACK_SUBMISSION_TIME: 500, // milliseconds
  PROGRESS_UPDATE_TIME: 25,    // milliseconds
  UI_RESPONSE_TIME: 100        // milliseconds
} as const;