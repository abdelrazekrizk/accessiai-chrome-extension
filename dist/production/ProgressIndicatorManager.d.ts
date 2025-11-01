/**
 * Progress Indicator Manager - Task 17: Status and Feedback System
 * Progress indicators for long-running operations
 * Following Integration Phase Template System - Phase 3: Placeholder Implementation
 */
import type { ProgressIndicatorManager as IProgressIndicatorManager, ProgressIndicator, ProgressConfig, ProgressUpdate, ProgressResult, ProgressStatus, ProgressNotificationConfig, ProductionComponentStatus, ProductionComponentMetrics } from '../types/production';
export declare class ProgressIndicatorManager implements IProgressIndicatorManager {
    private static instance;
    static getInstance(): ProgressIndicatorManager;
    private activeProgress;
    private progressContainer;
    private notificationConfig;
    private isInitialized;
    private operationCount;
    private errorCount;
    private lastOperationTime;
    private initializationTime;
    private progressIdCounter;
    private constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    createProgress(config: ProgressConfig): Promise<ProgressIndicator>;
    updateProgress(id: string, update: ProgressUpdate): Promise<void>;
    completeProgress(id: string, result?: ProgressResult): Promise<void>;
    cancelProgress(id: string): Promise<void>;
    getActiveProgress(): Promise<ProgressIndicator[]>;
    getStatus(): ProductionComponentStatus;
    getMetrics(): ProductionComponentMetrics;
    private createProgressContainer;
    private removeProgressContainer;
    private setupEventListeners;
    private removeEventListeners;
    private createProgressVisual;
    private updateProgressVisual;
    private removeProgressVisual;
    private generateProgressHTML;
    private getStatusIcon;
    private showProgressNotification;
    private handleKeyDown;
    updateNotificationConfig(config: Partial<ProgressNotificationConfig>): void;
    getActiveProgressCount(): number;
    getProgressById(id: string): ProgressIndicator | undefined;
    getProgressByStatus(status: ProgressStatus): ProgressIndicator[];
    hasActiveProgress(): boolean;
    createSimpleProgress(title: string, canCancel?: boolean): Promise<ProgressIndicator>;
    createSteppedProgress(title: string, totalSteps: number, canCancel?: boolean): Promise<ProgressIndicator>;
    createTimedProgress(title: string, estimatedDuration: number, canCancel?: boolean): Promise<ProgressIndicator>;
}
//# sourceMappingURL=ProgressIndicatorManager.d.ts.map