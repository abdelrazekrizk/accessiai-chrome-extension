/**
 * PanelAnalysisIntegration.ts
 *
 * Integration layer between UI panels and analysis systems
 * Connects AccessibilityPanel with UnifiedAnalysisCoordinator for:
 * - Real-time analysis updates
 * - Issue display and management
 * - Cross-component communication
 *
 * Performance Target: <50ms UI updates
 * Integration: Seamless panel-analysis coordination
 *
 * @version 2.0.0
 * @author AccessiAI Team
 */
import { UnifiedAnalysisResult } from '../utils/UnifiedAnalysisCoordinator';
import { AccessibilityIssue } from '../types/index';
/**
 * Integration event types
 */
export type IntegrationEventType = 'analysis-started' | 'analysis-progress' | 'analysis-completed' | 'analysis-failed' | 'issues-updated' | 'settings-changed' | 'panel-shown' | 'panel-hidden';
/**
 * Integration event data
 */
export interface IntegrationEvent {
    readonly type: IntegrationEventType;
    readonly timestamp: number;
    readonly source: string;
    readonly data?: any;
}
/**
 * Integration event listener
 */
export type IntegrationEventListener = (event: IntegrationEvent) => void;
/**
 * PanelAnalysisIntegration - Central integration coordinator
 *
 * Provides seamless integration between UI panels and analysis systems
 * with real-time updates and cross-component communication.
 */
export declare class PanelAnalysisIntegration {
    private static instance;
    private isInitialized;
    private isAnalysisRunning;
    private accessibilityPanel;
    private settingsPanel;
    private quickActionControls;
    private analysisCoordinator;
    private eventListeners;
    private currentAnalysisResult;
    private currentIssues;
    /**
     * Get singleton instance of PanelAnalysisIntegration
     */
    static getInstance(): PanelAnalysisIntegration;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
     * Initialize the integration system
     */
    initialize(): Promise<void>;
    /**
     * Run comprehensive accessibility analysis with UI updates
     */
    runAnalysis(): Promise<UnifiedAnalysisResult>;
    /**
     * Show accessibility panel with current issues
     */
    showAccessibilityPanel(): Promise<void>;
    /**
     * Show settings panel
     */
    showSettingsPanel(): Promise<void>;
    /**
     * Apply quick fix to an issue
     */
    applyQuickFix(issue: AccessibilityIssue): Promise<boolean>;
    /**
     * Set up event handlers for cross-component communication
     */
    private setupEventHandlers;
    /**
     * Add event listener
     */
    addEventListener(type: IntegrationEventType, listener: IntegrationEventListener): void;
    /**
     * Remove event listener
     */
    removeEventListener(type: IntegrationEventType, listener: IntegrationEventListener): void;
    /**
     * Emit integration event
     */
    private emitEvent;
    /**
     * Get current analysis result
     */
    getCurrentAnalysisResult(): UnifiedAnalysisResult | null;
    /**
     * Get current issues
     */
    getCurrentIssues(): AccessibilityIssue[];
    /**
     * Get integration status
     */
    getIntegrationStatus(): {
        isInitialized: boolean;
        isAnalysisRunning: boolean;
        currentIssueCount: number;
        hasAnalysisResult: boolean;
    };
}
//# sourceMappingURL=PanelAnalysisIntegration.d.ts.map