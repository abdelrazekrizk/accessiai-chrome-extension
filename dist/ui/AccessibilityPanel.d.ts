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
import { AccessibilityIssue, IssueSeverity, AccessibilityIssueType } from '../types/index';
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
    readonly startPosition: {
        x: number;
        y: number;
    };
    readonly currentPosition: {
        x: number;
        y: number;
    };
}
/**
 * AccessibilityPanel - Main floating accessibility panel interface
 *
 * Provides comprehensive accessibility issue management with real-time updates,
 * filtering, and interactive issue resolution capabilities.
 */
export declare class AccessibilityPanel {
    private static instance;
    private panelElement;
    private issueList;
    private filteredIssues;
    private filterSettings;
    private dragHandler;
    private panelPosition;
    private headerElement;
    private issueListElement;
    private filterElement;
    private statsElement;
    private isVisible;
    private isMinimized;
    private isInitialized;
    private readonly UI_UPDATE_TARGET;
    private updateCount;
    private totalUpdateTime;
    private boundEventListeners;
    /**
     * Get singleton instance of AccessibilityPanel
     */
    static getInstance(): AccessibilityPanel;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
     * Initialize and render the accessibility panel
     *
     * @returns Promise<void>
     */
    initialize(): Promise<void>;
    /**
     * Render the accessibility panel
     *
     * @returns Promise<void>
     */
    render(): Promise<void>;
    /**
     * Update issues displayed in the panel
     *
     * @param issues - Array of accessibility issues
     * @returns Promise<void>
     */
    updateIssues(issues: AccessibilityIssue[]): Promise<void>;
    /**
     * Show detailed information for a specific issue
     *
     * @param issue - Accessibility issue to show details for
     * @returns Promise<void>
     */
    showIssueDetails(issue: AccessibilityIssue): Promise<void>;
    /**
     * Apply filter settings to issue list
     *
     * @param filter - Filter settings to apply
     * @returns Promise<void>
     */
    applyFilter(filter: FilterSettings): Promise<void>;
    /**
     * Show the accessibility panel
     *
     * @returns Promise<void>
     */
    show(): Promise<void>;
    /**
     * Hide the accessibility panel
     *
     * @returns Promise<void>
     */
    hide(): Promise<void>;
    /**
     * Toggle panel visibility
     *
     * @returns Promise<void>
     */
    toggle(): Promise<void>;
    /**
     * Create the main panel structure
     *
     * @returns Promise<void>
     */
    private createPanelStructure;
    /**
     * Setup event listeners for panel interactions
     *
     * @returns Promise<void>
     */
    private setupEventListeners;
    /**
     * Render panel header with title and controls
     *
     * @returns Promise<void>
     */
    private renderHeader;
    /**
     * Render statistics section
     *
     * @returns Promise<void>
     */
    private renderStats;
    /**
     * Render filter controls
     *
     * @returns Promise<void>
     */
    private renderFilters;
    /**
     * Render issue list
     *
     * @returns Promise<void>
     */
    private renderIssueList;
    /**
     * Apply current filter settings to issue list
     */
    private applyCurrentFilters;
    /**
     * Create issue details modal
     *
     * @param issue - Accessibility issue
     * @returns HTMLElement - Modal element
     */
    private createIssueDetailsModal;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleKeyDown;
    private handleIssueClick;
    private handleIssueKeyDown;
    private handleDetailsClick;
    private handleMinimizeClick;
    private handleCloseClick;
    private handleSearchInput;
    private handleSeverityFilterChange;
    private handleWindowResize;
    private updatePanelPosition;
    private applyPanelStyles;
    private getSeverityIcon;
    private formatIssueType;
    private announceToScreenReader;
    private loadUserPreferences;
    private recordUpdateMetrics;
    /**
     * Cleanup resources and event listeners
     */
    shutdown(): Promise<void>;
}
export declare const accessibilityPanel: AccessibilityPanel;
export default accessibilityPanel;
//# sourceMappingURL=AccessibilityPanel.d.ts.map