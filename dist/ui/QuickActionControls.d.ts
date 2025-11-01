/**
 * QuickActionControls.ts
 *
 * Quick Action Controls System for AccessiAI Chrome Extension
 * Implements one-click accessibility fixes including:
 * - One-click accessibility fixes for common issues
 * - Keyboard navigation shortcuts with customizable bindings
 * - Voice command integration with speech recognition
 * - Automated accessibility improvements
 *
 * Performance Target: <100ms fix application
 * Success Rate: >95% for automated fixes
 *
 * @version 2.0.0
 * @author AccessiAI Team
 */
import { AccessibilityIssue, AccessibilityIssueType } from '../types/index';
/**
 * Quick fix action configuration
 */
export interface QuickFixAction {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly issueTypes: AccessibilityIssueType[];
    readonly keyboardShortcut?: string;
    readonly voiceCommand?: string;
    readonly isEnabled: boolean;
    readonly successRate: number;
}
/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
    readonly id: string;
    readonly key: string;
    readonly modifiers: string[];
    readonly action: string;
    readonly description: string;
    readonly isCustomizable: boolean;
}
/**
 * Voice command configuration
 */
export interface VoiceCommand {
    readonly id: string;
    readonly phrases: string[];
    readonly action: string;
    readonly description: string;
    readonly confidence: number;
}
/**
 * Fix application result
 */
export interface FixResult {
    readonly success: boolean;
    readonly issueId: string;
    readonly fixApplied: string;
    readonly elementsModified: number;
    readonly executionTime: number;
    readonly error?: string;
}
/**
 * QuickActionControls - One-click accessibility fixes and shortcuts
 *
 * Provides automated accessibility improvements with keyboard shortcuts
 * and voice command integration for rapid issue resolution.
 */
export declare class QuickActionControls {
    private static instance;
    private isInitialized;
    private isListening;
    private speechRecognition;
    private quickFixActions;
    private keyboardShortcuts;
    private voiceCommands;
    private readonly FIX_APPLICATION_TARGET;
    private readonly SUCCESS_RATE_TARGET;
    private fixCount;
    private successfulFixes;
    private totalFixTime;
    private boundEventListeners;
    /**
     * Get singleton instance of QuickActionControls
     */
    static getInstance(): QuickActionControls;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
     * Initialize the quick action controls system
     *
     * @returns Promise<void>
     */
    initialize(): Promise<void>;
    /**
     * Apply quick fix to accessibility issue
     *
     * @param issue - Accessibility issue to fix
     * @returns Promise<FixResult> - Fix application result
     */
    applyQuickFix(issue: AccessibilityIssue): Promise<FixResult>;
    /**
     * Apply multiple quick fixes in batch
     *
     * @param issues - Array of accessibility issues to fix
     * @returns Promise<FixResult[]> - Array of fix results
     */
    applyBatchFixes(issues: AccessibilityIssue[]): Promise<FixResult[]>;
    /**
     * Get available quick fix actions for issue type
     *
     * @param issueType - Accessibility issue type
     * @returns QuickFixAction[] - Available fix actions
     */
    getAvailableFixActions(issueType: AccessibilityIssueType): QuickFixAction[];
    /**
     * Start voice command listening
     *
     * @returns Promise<void>
     */
    startVoiceListening(): Promise<void>;
    /**
     * Stop voice command listening
     *
     * @returns Promise<void>
     */
    stopVoiceListening(): Promise<void>;
    /**
     * Execute keyboard shortcut action
     *
     * @param shortcutId - Keyboard shortcut ID
     * @returns Promise<boolean> - Success status
     */
    executeKeyboardShortcut(shortcutId: string): Promise<boolean>;
    /**
     * Setup quick fix actions
     *
     * @returns Promise<void>
     */
    private setupQuickFixActions;
    /**
     * Setup keyboard shortcuts
     *
     * @returns Promise<void>
     */
    private setupKeyboardShortcuts;
    /**
     * Setup voice commands
     *
     * @returns Promise<void>
     */
    private setupVoiceCommands;
    /**
     * Setup event listeners
     *
     * @returns Promise<void>
     */
    private setupEventListeners;
    /**
     * Get applicable fix action for issue type
     *
     * @param issueType - Accessibility issue type
     * @returns QuickFixAction | null - Applicable fix action
     */
    private getApplicableFixAction;
    /**
     * Execute fix action on accessibility issue
     *
     * @param issue - Accessibility issue
     * @param fixAction - Fix action to execute
     * @returns Promise<Partial<FixResult>> - Fix execution result
     */
    private executeFixAction;
    /**
     * Fix missing alt text for images
     *
     * @param image - Image element
     * @returns Promise<number> - Number of elements modified
     */
    private fixMissingAltText;
    /**
     * Fix missing labels for form controls
     *
     * @param element - Form control element
     * @returns Promise<number> - Number of elements modified
     */
    private fixMissingLabels;
    /**
     * Fix heading structure issues
     *
     * @param element - Heading element
     * @returns Promise<number> - Number of elements modified
     */
    private fixHeadingStructure;
    /**
     * Fix color contrast issues
     *
     * @param element - Element with contrast issues
     * @returns Promise<number> - Number of elements modified
     */
    private fixColorContrast;
    /**
     * Fix keyboard accessibility issues
     *
     * @param element - Element to make keyboard accessible
     * @returns Promise<number> - Number of elements modified
     */
    private fixKeyboardAccess;
    /**
     * Fix focus management issues
     *
     * @param element - Element with focus issues
     * @returns Promise<number> - Number of elements modified
     */
    private fixFocusManagement;
    private handleKeyDown;
    private handleSpeechResult;
    private handleSpeechError;
    private handleSpeechEnd;
    private handleElementKeyDown;
    private handleElementFocus;
    private handleElementBlur;
    private findElementByInfo;
    private generateAltText;
    private generateLabelText;
    private calculateCorrectHeadingLevel;
    private getHighContrastColors;
    private isLightColor;
    private isDarkColor;
    private isFocusable;
    private isInteractive;
    private getShortcutKey;
    private matchesShortcut;
    private executeAction;
    private showVoiceCommandHelp;
    private announceToUser;
    private recordFixMetrics;
    /**
     * Get system performance metrics
     *
     * @returns Object with performance metrics
     */
    getPerformanceMetrics(): {
        fixCount: number;
        successRate: number;
        averageFixTime: number;
        isListening: boolean;
    };
    /**
     * Cleanup resources and event listeners
     */
    shutdown(): Promise<void>;
}
export declare const quickActionControls: QuickActionControls;
export default quickActionControls;
//# sourceMappingURL=QuickActionControls.d.ts.map