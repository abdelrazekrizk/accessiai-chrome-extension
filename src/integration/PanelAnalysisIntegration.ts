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

import { AccessibilityPanel } from '../ui/AccessibilityPanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { QuickActionControls } from '../ui/QuickActionControls';
import { UnifiedAnalysisCoordinator, UnifiedAnalysisResult, AnalysisProgressCallback } from '../utils/UnifiedAnalysisCoordinator';
import { AccessibilityIssue } from '../types/index';

/**
 * Integration event types
 */
export type IntegrationEventType = 
  | 'analysis-started'
  | 'analysis-progress'
  | 'analysis-completed'
  | 'analysis-failed'
  | 'issues-updated'
  | 'settings-changed'
  | 'panel-shown'
  | 'panel-hidden';

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
export class PanelAnalysisIntegration {
  private static instance: PanelAnalysisIntegration;
  
  // Core Properties
  private isInitialized: boolean = false;
  private isAnalysisRunning: boolean = false;
  
  // Component References
  private accessibilityPanel: AccessibilityPanel;
  private settingsPanel: SettingsPanel;
  private quickActionControls: QuickActionControls;
  private analysisCoordinator: UnifiedAnalysisCoordinator;
  
  // Event System
  private eventListeners: Map<IntegrationEventType, IntegrationEventListener[]> = new Map();
  
  // Current State
  private currentAnalysisResult: UnifiedAnalysisResult | null = null;
  private currentIssues: AccessibilityIssue[] = [];

  /**
   * Get singleton instance of PanelAnalysisIntegration
   */
  static getInstance(): PanelAnalysisIntegration {
    if (!PanelAnalysisIntegration.instance) {
      PanelAnalysisIntegration.instance = new PanelAnalysisIntegration();
    }
    return PanelAnalysisIntegration.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    console.log('[PanelAnalysisIntegration] Initializing Panel-Analysis Integration System...');
    
    // Get component instances
    this.accessibilityPanel = AccessibilityPanel.getInstance();
    this.settingsPanel = SettingsPanel.getInstance();
    this.quickActionControls = QuickActionControls.getInstance();
    this.analysisCoordinator = UnifiedAnalysisCoordinator.getInstance();
  }

  /**
   * Initialize the integration system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[PanelAnalysisIntegration] Already initialized, skipping...');
      return;
    }

    const startTime = performance.now();
    
    try {
      console.log('[PanelAnalysisIntegration] Starting integration initialization...');
      
      // Initialize all components
      await Promise.all([
        this.accessibilityPanel.initialize(),
        this.settingsPanel.initialize(),
        this.quickActionControls.initialize(),
        this.analysisCoordinator.initialize()
      ]);
      
      // Set up cross-component communication
      this.setupEventHandlers();
      
      this.isInitialized = true;
      const initTime = performance.now() - startTime;
      
      console.log(`[PanelAnalysisIntegration] Integration initialized in ${initTime.toFixed(2)}ms`);
      
      // Emit initialization event
      this.emitEvent('analysis-started', 'integration', { initialized: true });
      
    } catch (error) {
      console.error('[PanelAnalysisIntegration] Integration initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive accessibility analysis with UI updates
   */
  async runAnalysis(): Promise<UnifiedAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isAnalysisRunning) {
      console.warn('[PanelAnalysisIntegration] Analysis already running, skipping...');
      throw new Error('Analysis already in progress');
    }

    this.isAnalysisRunning = true;
    
    try {
      console.log('[PanelAnalysisIntegration] Starting integrated accessibility analysis...');
      
      // Emit analysis started event
      this.emitEvent('analysis-started', 'integration');
      
      // Show accessibility panel
      await this.accessibilityPanel.show();
      this.emitEvent('panel-shown', 'accessibility-panel');
      
      // Create progress callback for UI updates
      const progressCallback: AnalysisProgressCallback = (progress) => {
        console.log(`[PanelAnalysisIntegration] Analysis progress: ${progress.percentage}% - ${progress.currentTask}`);
        this.emitEvent('analysis-progress', 'integration', progress);
      };
      
      // Run unified analysis
      const result = await this.analysisCoordinator.analyzeAccessibility(
        document,
        {
          enableContentAnalysis: true,
          enableVisualAnalysis: true,
          enableParallelExecution: true,
          storeResults: true
        },
        progressCallback
      );
      
      // Update current state
      this.currentAnalysisResult = result;
      this.currentIssues = result.aggregatedIssues;
      
      // Update accessibility panel with results
      await this.accessibilityPanel.updateIssues(result.aggregatedIssues);
      
      // Emit completion events
      this.emitEvent('analysis-completed', 'integration', result);
      this.emitEvent('issues-updated', 'integration', { 
        issues: result.aggregatedIssues,
        totalCount: result.totalIssues 
      });
      
      console.log(`[PanelAnalysisIntegration] Analysis completed successfully with ${result.totalIssues} issues found`);
      
      return result;
      
    } catch (error) {
      console.error('[PanelAnalysisIntegration] Analysis failed:', error);
      this.emitEvent('analysis-failed', 'integration', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      this.isAnalysisRunning = false;
    }
  }

  /**
   * Show accessibility panel with current issues
   */
  async showAccessibilityPanel(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    await this.accessibilityPanel.show();
    this.emitEvent('panel-shown', 'accessibility-panel');
    
    // If we have current issues, update the panel
    if (this.currentIssues.length > 0) {
      await this.accessibilityPanel.updateIssues(this.currentIssues);
    }
  }

  /**
   * Show settings panel
   */
  async showSettingsPanel(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    await this.settingsPanel.show();
    this.emitEvent('panel-shown', 'settings-panel');
  }

  /**
   * Apply quick fix to an issue
   */
  async applyQuickFix(issue: AccessibilityIssue): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      console.log(`[PanelAnalysisIntegration] Applying quick fix for issue: ${issue.type}`);
      
      const result = await this.quickActionControls.applyQuickFix(issue);
      
      if (result.success) {
        // Remove the fixed issue from current issues
        this.currentIssues = this.currentIssues.filter(i => i.id !== issue.id);
        
        // Update accessibility panel
        await this.accessibilityPanel.updateIssues(this.currentIssues);
        
        // Emit update event
        this.emitEvent('issues-updated', 'integration', { 
          issues: this.currentIssues,
          totalCount: this.currentIssues.length,
          fixedIssue: issue
        });
        
        console.log(`[PanelAnalysisIntegration] Quick fix applied successfully in ${result.executionTime}ms`);
      }
      
      return result.success;
      
    } catch (error) {
      console.error('[PanelAnalysisIntegration] Quick fix failed:', error);
      return false;
    }
  }

  /**
   * Set up event handlers for cross-component communication
   */
  private setupEventHandlers(): void {
    console.log('[PanelAnalysisIntegration] Setting up cross-component event handlers...');
    
    // Listen for settings changes
    this.addEventListener('settings-changed', (_event) => {
      console.log('[PanelAnalysisIntegration] Settings changed, updating components...');
      // Could trigger re-analysis or update component configurations
    });
    
    // Listen for panel visibility changes
    this.addEventListener('panel-shown', (event) => {
      console.log(`[PanelAnalysisIntegration] Panel shown: ${event.source}`);
    });
    
    this.addEventListener('panel-hidden', (event) => {
      console.log(`[PanelAnalysisIntegration] Panel hidden: ${event.source}`);
    });
  }

  /**
   * Add event listener
   */
  addEventListener(type: IntegrationEventType, listener: IntegrationEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: IntegrationEventType, listener: IntegrationEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit integration event
   */
  private emitEvent(type: IntegrationEventType, source: string, data?: any): void {
    const event: IntegrationEvent = {
      type,
      timestamp: Date.now(),
      source,
      data
    };
    
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[PanelAnalysisIntegration] Event listener error for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Get current analysis result
   */
  getCurrentAnalysisResult(): UnifiedAnalysisResult | null {
    return this.currentAnalysisResult;
  }

  /**
   * Get current issues
   */
  getCurrentIssues(): AccessibilityIssue[] {
    return [...this.currentIssues];
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(): {
    isInitialized: boolean;
    isAnalysisRunning: boolean;
    currentIssueCount: number;
    hasAnalysisResult: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isAnalysisRunning: this.isAnalysisRunning,
      currentIssueCount: this.currentIssues.length,
      hasAnalysisResult: this.currentAnalysisResult !== null
    };
  }
}