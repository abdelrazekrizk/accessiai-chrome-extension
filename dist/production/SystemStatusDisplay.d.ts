/**
 * System Status Display - Task 17: Status and Feedback System
 * Real-time system status display with agent health indicators
 * Following Integration Phase Template System - Phase 3: Placeholder Implementation
 */
import type { SystemHealthReport, SystemStatus } from '../types/index';
import type { SystemStatusDisplay as ISystemStatusDisplay, StatusDisplayState, StatusDisplayMode, StatusPosition, StatusIndicatorConfig, ProductionComponentStatus, ProductionComponentMetrics } from '../types/production';
export declare class SystemStatusDisplay implements ISystemStatusDisplay {
    private static instance;
    static getInstance(): SystemStatusDisplay;
    private statusElement;
    private badgeElement;
    private panelElement;
    private currentStatus;
    private isVisible;
    private displayMode;
    private position;
    private lastUpdate;
    private config;
    private isInitialized;
    private autoHideTimer;
    private constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    updateStatus(healthReport: SystemHealthReport): Promise<void>;
    showStatusIndicator(status: SystemStatus): Promise<void>;
    hideStatusIndicator(): Promise<void>;
    getDisplayState(): StatusDisplayState;
    getStatus(): ProductionComponentStatus;
    getMetrics(): ProductionComponentMetrics;
    private createStatusElements;
    private removeStatusElements;
    private setupEventListeners;
    private removeEventListeners;
    private applyConfiguration;
    private applyPositioning;
    private updateStatusVisuals;
    private showBadge;
    private showPanel;
    private showNotification;
    private showMinimal;
    private showStatusChangeNotification;
    private updateBadge;
    private setupAutoHide;
    private getStatusText;
    private generatePanelContent;
    private handleBadgeClick;
    private handleKeyDown;
    updateConfiguration(config: Partial<StatusIndicatorConfig>): void;
    setDisplayMode(mode: StatusDisplayMode): void;
    setPosition(position: StatusPosition): void;
}
//# sourceMappingURL=SystemStatusDisplay.d.ts.map