/**
 * User Feedback Collector - Task 17: Status and Feedback System
 * User feedback collection with accessibility compliance
 * Following Integration Phase Template System - Phase 3: Placeholder Implementation
 */
import type { UserFeedbackCollector as IUserFeedbackCollector, UserFeedback, FeedbackContext, FeedbackSubmissionResult, FeedbackFormConfig, FeedbackType, FeedbackCategory, FeedbackSeverity, FeedbackExportFormat, ProductionComponentStatus, ProductionComponentMetrics } from '../types/production';
export declare class UserFeedbackCollector implements IUserFeedbackCollector {
    private static instance;
    static getInstance(): UserFeedbackCollector;
    private feedbackHistory;
    private feedbackForm;
    private isFormVisible;
    private config;
    private isInitialized;
    private operationCount;
    private errorCount;
    private lastOperationTime;
    private initializationTime;
    private constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    showFeedbackForm(context?: FeedbackContext): Promise<void>;
    collectFeedback(feedback: UserFeedback): Promise<FeedbackSubmissionResult>;
    getFeedbackHistory(): Promise<UserFeedback[]>;
    exportFeedback(format: FeedbackExportFormat): Promise<string>;
    getStatus(): ProductionComponentStatus;
    getMetrics(): ProductionComponentMetrics;
    private createFeedbackForm;
    private removeFeedbackForm;
    private setupEventListeners;
    private removeEventListeners;
    private loadFeedbackHistory;
    private saveFeedbackHistory;
    private populateFormWithContext;
    private validateFeedback;
    private generateFormHTML;
    private hideFeedbackForm;
    private exportAsCSV;
    private exportAsHTML;
    private handleFormSubmit;
    private handleCloseForm;
    private handleKeyDown;
    updateConfiguration(config: Partial<FeedbackFormConfig>): void;
    getFeedbackCount(): number;
    getFeedbackByType(type: FeedbackType): UserFeedback[];
    getFeedbackByCategory(category: FeedbackCategory): UserFeedback[];
    getFeedbackBySeverity(severity: FeedbackSeverity): UserFeedback[];
}
//# sourceMappingURL=UserFeedbackCollector.d.ts.map