/**
 * SettingsPanel.ts
 *
 * Settings Panel Interface for AccessiAI Chrome Extension
 * Implements comprehensive settings management including:
 * - User preference management with local storage
 * - Accessibility profile selection with predefined configurations
 * - Custom rule configuration with user-defined criteria
 * - Real-time settings validation and application
 *
 * Performance Target: <50ms UI updates, <100ms settings operations
 * Accessibility: WCAG 2.1 AA compliant interface
 *
 * @version 2.0.0
 * @author AccessiAI Team
 */
import { SettingsConfig } from '../types/index';
/**
 * SettingsPanel - Main settings management interface
 *
 * Provides comprehensive settings management with user preferences,
 * accessibility profiles, and real-time validation capabilities.
 */
export declare class SettingsPanel {
    private static instance;
    private panelElement;
    private isVisible;
    private currentSettings;
    private isDirty;
    private isInitialized;
    private updateCount;
    private totalUpdateTime;
    private boundEventListeners;
    private readonly DEFAULT_PROFILES;
    private readonly DEFAULT_SHORTCUTS;
    /**
     * Get singleton instance of SettingsPanel
     */
    static getInstance(): SettingsPanel;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
      * Initialize the settings panel
      */
    initialize(): Promise<void>;
    /**
     * Show the settings panel
     */
    show(): Promise<void>;
    /**
     * Hide the settings panel
     */
    hide(): Promise<void>;
    /**
     * Toggle panel visibility
     */
    toggle(): Promise<void>;
    private loadSettings;
    /**
     * Save settings to storage
     */
    private saveSettings;
    /**
     * Create default settings configuration
     */
    private createDefaultSettings; /**
     *
   Create the main panel element
     */
    private createPanelElement;
    /**
     * Generate the panel HTML structure
     */
    private generatePanelHTML;
    /**
     * Apply CSS styles to the panel
     */
    private applyPanelStyles; /**
  
     * Set up event listeners
     */
    private setupEventListeners;
    /**
     * Handle global keyboard shortcuts
     */
    private handleGlobalKeydown;
    /**
     * Validate settings configuration
     */
    private validateSettings;
    /**
     * Bind event handlers to maintain proper 'this' context
     */
    private bindEventHandlers;
    /**
     * Announce message to screen readers
     */
    private announceToScreenReader;
    /**
     * Get current settings
     */
    getSettings(): SettingsConfig | null;
    /**
     * Update specific setting
     */
    updateSetting(path: string, value: unknown): Promise<void>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        updateCount: number;
        totalUpdateTime: number;
        averageUpdateTime: number;
    };
    /**
     * Cleanup resources and event listeners
     */
    destroy(): void;
}
//# sourceMappingURL=SettingsPanel.d.ts.map