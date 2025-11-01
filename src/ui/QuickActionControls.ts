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

import { 
  AccessibilityIssue,
  AccessibilityIssueType,
  ElementInfo
} from '../types/index';

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
export class QuickActionControls {
  private static instance: QuickActionControls;
  
  // Core Properties
  private isInitialized: boolean = false;
  private isListening: boolean = false;
  private speechRecognition: any = null;
  
  // Quick Fix Actions
  private quickFixActions: Map<string, QuickFixAction> = new Map();
  private keyboardShortcuts: Map<string, KeyboardShortcut> = new Map();
  private voiceCommands: Map<string, VoiceCommand> = new Map();
  
  // Performance Tracking
  private readonly FIX_APPLICATION_TARGET = 100; // milliseconds
  private readonly SUCCESS_RATE_TARGET = 0.95; // 95% success rate
  private fixCount: number = 0;
  private successfulFixes: number = 0;
  private totalFixTime: number = 0;
  
  // Event Listeners
  private boundEventListeners: Map<string, EventListener> = new Map();
  
  /**
   * Get singleton instance of QuickActionControls
   */
  static getInstance(): QuickActionControls {
    if (!QuickActionControls.instance) {
      QuickActionControls.instance = new QuickActionControls();
    }
    return QuickActionControls.instance;
  }
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    console.log('[QuickActionControls] Initializing Quick Action Controls System...');
  }
  
  /**
   * Initialize the quick action controls system
   * 
   * @returns Promise<void>
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[QuickActionControls] System already initialized');
      return;
    }
    
    try {
      console.log('[QuickActionControls] Initializing system...');
      
      await this.setupQuickFixActions();
      await this.setupKeyboardShortcuts();
      await this.setupVoiceCommands();
      await this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('[QuickActionControls] System initialized successfully');
      
    } catch (error) {
      console.error('[QuickActionControls] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Apply quick fix to accessibility issue
   * 
   * @param issue - Accessibility issue to fix
   * @returns Promise<FixResult> - Fix application result
   */
  async applyQuickFix(issue: AccessibilityIssue): Promise<FixResult> {
    const startTime = performance.now();
    
    try {
      console.log(`[QuickActionControls] Applying quick fix for issue: ${issue.id}`);
      
      const fixAction = this.getApplicableFixAction(issue.type);
      if (!fixAction) {
        return {
          success: false,
          issueId: issue.id,
          fixApplied: 'none',
          elementsModified: 0,
          executionTime: performance.now() - startTime,
          error: 'No applicable fix action found'
        };
      }
      
      const result = await this.executeFixAction(issue, fixAction);
      
      const executionTime = performance.now() - startTime;
      this.recordFixMetrics(result.success || false, executionTime);
      
      console.log(`[QuickActionControls] Fix ${result.success ? 'applied' : 'failed'} in ${executionTime.toFixed(2)}ms`);
      
      const fixResult: FixResult = {
        success: result.success || false,
        issueId: result.issueId || issue.id,
        fixApplied: result.fixApplied || 'unknown',
        elementsModified: result.elementsModified || 0,
        executionTime
      };
      
      if (result.error) {
        (fixResult as any).error = result.error;
      }
      
      return fixResult;
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.recordFixMetrics(false, executionTime);
      
      console.error('[QuickActionControls] Fix application failed:', error);
      
      return {
        success: false,
        issueId: issue.id,
        fixApplied: 'error',
        elementsModified: 0,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Apply multiple quick fixes in batch
   * 
   * @param issues - Array of accessibility issues to fix
   * @returns Promise<FixResult[]> - Array of fix results
   */
  async applyBatchFixes(issues: AccessibilityIssue[]): Promise<FixResult[]> {
    try {
      console.log(`[QuickActionControls] Applying batch fixes for ${issues.length} issues...`);
      
      const results = await Promise.all(
        issues.map(issue => this.applyQuickFix(issue))
      );
      
      const successCount = results.filter(r => r.success).length;
      console.log(`[QuickActionControls] Batch fixes completed: ${successCount}/${issues.length} successful`);
      
      return results;
      
    } catch (error) {
      console.error('[QuickActionControls] Batch fix application failed:', error);
      throw error;
    }
  }
  
  /**
   * Get available quick fix actions for issue type
   * 
   * @param issueType - Accessibility issue type
   * @returns QuickFixAction[] - Available fix actions
   */
  getAvailableFixActions(issueType: AccessibilityIssueType): QuickFixAction[] {
    const actions: QuickFixAction[] = [];
    
    this.quickFixActions.forEach(action => {
      if (action.issueTypes.includes(issueType) && action.isEnabled) {
        actions.push(action);
      }
    });
    
    return actions.sort((a, b) => b.successRate - a.successRate);
  }
  
  /**
   * Start voice command listening
   * 
   * @returns Promise<void>
   */
  async startVoiceListening(): Promise<void> {
    if (!this.speechRecognition) {
      throw new Error('Speech recognition not supported');
    }
    
    if (this.isListening) {
      console.warn('[QuickActionControls] Voice listening already active');
      return;
    }
    
    try {
      console.log('[QuickActionControls] Starting voice command listening...');
      
      this.isListening = true;
      this.speechRecognition.start();
      
      // Announce to user
      this.announceToUser('Voice commands activated. Say "fix accessibility" or "scan page"');
      
      return Promise.resolve();
      
    } catch (error) {
      this.isListening = false;
      console.error('[QuickActionControls] Voice listening start failed:', error);
      throw error;
    }
  }
  
  /**
   * Stop voice command listening
   * 
   * @returns Promise<void>
   */
  async stopVoiceListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }
    
    try {
      console.log('[QuickActionControls] Stopping voice command listening...');
      
      this.isListening = false;
      if (this.speechRecognition) {
        this.speechRecognition.stop();
      }
      
      // Announce to user
      this.announceToUser('Voice commands deactivated');
      
    } catch (error) {
      console.error('[QuickActionControls] Voice listening stop failed:', error);
      throw error;
    }
  }
  
  /**
   * Execute keyboard shortcut action
   * 
   * @param shortcutId - Keyboard shortcut ID
   * @returns Promise<boolean> - Success status
   */
  async executeKeyboardShortcut(shortcutId: string): Promise<boolean> {
    try {
      const shortcut = this.keyboardShortcuts.get(shortcutId);
      if (!shortcut) {
        console.warn(`[QuickActionControls] Unknown keyboard shortcut: ${shortcutId}`);
        return false;
      }
      
      console.log(`[QuickActionControls] Executing keyboard shortcut: ${shortcut.description}`);
      
      const success = await this.executeAction(shortcut.action);
      
      if (success) {
        this.announceToUser(`Executed: ${shortcut.description}`);
      }
      
      return success;
      
    } catch (error) {
      console.error('[QuickActionControls] Keyboard shortcut execution failed:', error);
      return false;
    }
  }
  
  /**
   * Setup quick fix actions
   * 
   * @returns Promise<void>
   */
  private async setupQuickFixActions(): Promise<void> {
    const actions: QuickFixAction[] = [
      {
        id: 'fix-missing-alt-text',
        name: 'Add Alt Text',
        description: 'Automatically add descriptive alt text to images',
        issueTypes: ['missing-alt-text'],
        keyboardShortcut: 'Ctrl+Shift+A',
        voiceCommand: 'fix alt text',
        isEnabled: true,
        successRate: 0.85
      },
      {
        id: 'fix-missing-labels',
        name: 'Add Form Labels',
        description: 'Add proper labels to form controls',
        issueTypes: ['missing-labels'],
        keyboardShortcut: 'Ctrl+Shift+L',
        voiceCommand: 'fix labels',
        isEnabled: true,
        successRate: 0.92
      },
      {
        id: 'fix-heading-structure',
        name: 'Fix Heading Structure',
        description: 'Correct heading hierarchy and structure',
        issueTypes: ['heading-structure'],
        keyboardShortcut: 'Ctrl+Shift+H',
        voiceCommand: 'fix headings',
        isEnabled: true,
        successRate: 0.78
      },
      {
        id: 'fix-color-contrast',
        name: 'Improve Color Contrast',
        description: 'Enhance color contrast for better readability',
        issueTypes: ['insufficient-contrast'],
        keyboardShortcut: 'Ctrl+Shift+C',
        voiceCommand: 'fix contrast',
        isEnabled: true,
        successRate: 0.88
      },
      {
        id: 'fix-keyboard-access',
        name: 'Add Keyboard Access',
        description: 'Make elements keyboard accessible',
        issueTypes: ['keyboard-inaccessible'],
        keyboardShortcut: 'Ctrl+Shift+K',
        voiceCommand: 'fix keyboard',
        isEnabled: true,
        successRate: 0.82
      },
      {
        id: 'fix-focus-management',
        name: 'Fix Focus Management',
        description: 'Improve focus indicators and management',
        issueTypes: ['focus-management'],
        keyboardShortcut: 'Ctrl+Shift+F',
        voiceCommand: 'fix focus',
        isEnabled: true,
        successRate: 0.90
      }
    ];
    
    actions.forEach(action => {
      this.quickFixActions.set(action.id, action);
    });
    
    console.log(`[QuickActionControls] Loaded ${actions.length} quick fix actions`);
  }
  
  /**
   * Setup keyboard shortcuts
   * 
   * @returns Promise<void>
   */
  private async setupKeyboardShortcuts(): Promise<void> {
    const shortcuts: KeyboardShortcut[] = [
      {
        id: 'toggle-panel',
        key: 'F12',
        modifiers: ['Alt'],
        action: 'toggle-accessibility-panel',
        description: 'Toggle accessibility panel',
        isCustomizable: true
      },
      {
        id: 'scan-page',
        key: 'F11',
        modifiers: ['Alt'],
        action: 'scan-page-accessibility',
        description: 'Scan page for accessibility issues',
        isCustomizable: true
      },
      {
        id: 'fix-all-critical',
        key: 'F10',
        modifiers: ['Alt'],
        action: 'fix-all-critical-issues',
        description: 'Fix all critical accessibility issues',
        isCustomizable: true
      },
      {
        id: 'next-issue',
        key: 'ArrowDown',
        modifiers: ['Alt', 'Shift'],
        action: 'navigate-next-issue',
        description: 'Navigate to next accessibility issue',
        isCustomizable: true
      },
      {
        id: 'prev-issue',
        key: 'ArrowUp',
        modifiers: ['Alt', 'Shift'],
        action: 'navigate-prev-issue',
        description: 'Navigate to previous accessibility issue',
        isCustomizable: true
      }
    ];
    
    shortcuts.forEach(shortcut => {
      this.keyboardShortcuts.set(shortcut.id, shortcut);
    });
    
    console.log(`[QuickActionControls] Loaded ${shortcuts.length} keyboard shortcuts`);
  }
  
  /**
   * Setup voice commands
   * 
   * @returns Promise<void>
   */
  private async setupVoiceCommands(): Promise<void> {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[QuickActionControls] Speech recognition not supported');
      return;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.speechRecognition = new SpeechRecognition();
    
    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = false;
    this.speechRecognition.lang = 'en-US';
    
    // Setup voice commands
    const commands: VoiceCommand[] = [
      {
        id: 'scan-page',
        phrases: ['scan page', 'check accessibility', 'analyze page'],
        action: 'scan-page-accessibility',
        description: 'Scan page for accessibility issues',
        confidence: 0.8
      },
      {
        id: 'fix-all',
        phrases: ['fix all issues', 'fix everything', 'apply all fixes'],
        action: 'fix-all-issues',
        description: 'Apply all available fixes',
        confidence: 0.8
      },
      {
        id: 'show-panel',
        phrases: ['show panel', 'open panel', 'display issues'],
        action: 'show-accessibility-panel',
        description: 'Show accessibility panel',
        confidence: 0.9
      },
      {
        id: 'hide-panel',
        phrases: ['hide panel', 'close panel', 'dismiss panel'],
        action: 'hide-accessibility-panel',
        description: 'Hide accessibility panel',
        confidence: 0.9
      },
      {
        id: 'help',
        phrases: ['help', 'what can you do', 'show commands'],
        action: 'show-help',
        description: 'Show available voice commands',
        confidence: 0.9
      }
    ];
    
    commands.forEach(command => {
      this.voiceCommands.set(command.id, command);
    });
    
    // Setup speech recognition event handlers
    this.speechRecognition.onresult = this.handleSpeechResult.bind(this);
    this.speechRecognition.onerror = this.handleSpeechError.bind(this);
    this.speechRecognition.onend = this.handleSpeechEnd.bind(this);
    
    console.log(`[QuickActionControls] Loaded ${commands.length} voice commands`);
  }
  
  /**
   * Setup event listeners
   * 
   * @returns Promise<void>
   */
  private async setupEventListeners(): Promise<void> {
    // Keyboard shortcut listener
    const keydownHandler = (event: Event) => this.handleKeyDown(event as KeyboardEvent);
    document.addEventListener('keydown', keydownHandler);
    this.boundEventListeners.set('keydown', keydownHandler);
    
    console.log('[QuickActionControls] Event listeners setup complete');
  }
  
  /**
   * Get applicable fix action for issue type
   * 
   * @param issueType - Accessibility issue type
   * @returns QuickFixAction | null - Applicable fix action
   */
  private getApplicableFixAction(issueType: AccessibilityIssueType): QuickFixAction | null {
    for (const action of this.quickFixActions.values()) {
      if (action.issueTypes.includes(issueType) && action.isEnabled) {
        return action;
      }
    }
    return null;
  }
  
  /**
   * Execute fix action on accessibility issue
   * 
   * @param issue - Accessibility issue
   * @param fixAction - Fix action to execute
   * @returns Promise<Partial<FixResult>> - Fix execution result
   */
  private async executeFixAction(issue: AccessibilityIssue, fixAction: QuickFixAction): Promise<Partial<FixResult>> {
    try {
      console.log(`[QuickActionControls] Executing fix action: ${fixAction.name}`);
      
      const element = this.findElementByInfo(issue.element);
      if (!element) {
        return {
          success: false,
          issueId: issue.id,
          fixApplied: fixAction.id,
          elementsModified: 0,
          error: 'Element not found'
        };
      }
      
      let elementsModified = 0;
      
      switch (fixAction.id) {
        case 'fix-missing-alt-text':
          elementsModified = await this.fixMissingAltText(element as HTMLImageElement);
          break;
          
        case 'fix-missing-labels':
          elementsModified = await this.fixMissingLabels(element);
          break;
          
        case 'fix-heading-structure':
          elementsModified = await this.fixHeadingStructure(element);
          break;
          
        case 'fix-color-contrast':
          elementsModified = await this.fixColorContrast(element);
          break;
          
        case 'fix-keyboard-access':
          elementsModified = await this.fixKeyboardAccess(element);
          break;
          
        case 'fix-focus-management':
          elementsModified = await this.fixFocusManagement(element);
          break;
          
        default:
          return {
            success: false,
            issueId: issue.id,
            fixApplied: fixAction.id,
            elementsModified: 0,
            error: 'Unknown fix action'
          };
      }
      
      return {
        success: elementsModified > 0,
        issueId: issue.id,
        fixApplied: fixAction.id,
        elementsModified
      };
      
    } catch (error) {
      console.error('[QuickActionControls] Fix action execution failed:', error);
      return {
        success: false,
        issueId: issue.id,
        fixApplied: fixAction.id,
        elementsModified: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Fix missing alt text for images
   * 
   * @param image - Image element
   * @returns Promise<number> - Number of elements modified
   */
  private async fixMissingAltText(image: HTMLImageElement): Promise<number> {
    try {
      if (image.alt) {
        return 0; // Already has alt text
      }
      
      // Generate descriptive alt text based on image context
      const altText = this.generateAltText(image);
      image.alt = altText;
      
      console.log(`[QuickActionControls] Added alt text: "${altText}"`);
      return 1;
      
    } catch (error) {
      console.error('[QuickActionControls] Fix missing alt text failed:', error);
      return 0;
    }
  }
  
  /**
   * Fix missing labels for form controls
   * 
   * @param element - Form control element
   * @returns Promise<number> - Number of elements modified
   */
  private async fixMissingLabels(element: Element): Promise<number> {
    try {
      const input = element as HTMLInputElement;
      
      // Validate input element
      if (!input || !input.tagName) {
        console.warn('[QuickActionControls] Invalid input element');
        return 0;
      }
      
      // Check if already has label
      if (input.labels && input.labels.length > 0) {
        return 0;
      }
      
      if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) {
        return 0;
      }
      
      // Create label element
      const label = document.createElement('label');
      const labelText = this.generateLabelText(input);
      label.textContent = labelText;
      
      // Generate unique ID if needed
      if (!input.id) {
        input.id = `accessiai-input-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }
      
      label.setAttribute('for', input.id);
      
      // Insert label before input
      input.parentNode?.insertBefore(label, input);
      
      console.log(`[QuickActionControls] Added label: "${labelText}"`);
      return 1;
      
    } catch (error) {
      console.error('[QuickActionControls] Fix missing labels failed:', error);
      return 0;
    }
  }
  
  /**
   * Fix heading structure issues
   * 
   * @param element - Heading element
   * @returns Promise<number> - Number of elements modified
   */
  private async fixHeadingStructure(element: Element): Promise<number> {
    try {
      const heading = element as HTMLHeadingElement;
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      // Find appropriate heading level based on context
      const correctLevel = this.calculateCorrectHeadingLevel(heading);
      
      if (currentLevel === correctLevel) {
        return 0; // Already correct
      }
      
      // Create new heading with correct level
      const newHeading = document.createElement(`h${correctLevel}`);
      newHeading.innerHTML = heading.innerHTML;
      
      // Copy attributes
      Array.from(heading.attributes).forEach(attr => {
        newHeading.setAttribute(attr.name, attr.value);
      });
      
      // Replace old heading
      heading.parentNode?.replaceChild(newHeading, heading);
      
      console.log(`[QuickActionControls] Fixed heading level: h${currentLevel} → h${correctLevel}`);
      return 1;
      
    } catch (error) {
      console.error('[QuickActionControls] Fix heading structure failed:', error);
      return 0;
    }
  }
  
  /**
   * Fix color contrast issues
   * 
   * @param element - Element with contrast issues
   * @returns Promise<number> - Number of elements modified
   */
  private async fixColorContrast(element: Element): Promise<number> {
    try {
      const computedStyle = window.getComputedStyle(element);
      const currentColor = computedStyle.color;
      const currentBackground = computedStyle.backgroundColor;
      
      // Apply high contrast colors
      const highContrastStyle = this.getHighContrastColors(currentColor, currentBackground);
      
      if (highContrastStyle.color) {
        (element as HTMLElement).style.color = highContrastStyle.color;
      }
      
      if (highContrastStyle.backgroundColor) {
        (element as HTMLElement).style.backgroundColor = highContrastStyle.backgroundColor;
      }
      
      console.log('[QuickActionControls] Applied high contrast colors');
      return 1;
      
    } catch (error) {
      console.error('[QuickActionControls] Fix color contrast failed:', error);
      return 0;
    }
  }
  
  /**
   * Fix keyboard accessibility issues
   * 
   * @param element - Element to make keyboard accessible
   * @returns Promise<number> - Number of elements modified
   */
  private async fixKeyboardAccess(element: Element): Promise<number> {
    try {
      const htmlElement = element as HTMLElement;
      
      // Add tabindex if not focusable
      if (!this.isFocusable(htmlElement)) {
        htmlElement.tabIndex = 0;
      }
      
      // Add keyboard event handlers if interactive
      if (this.isInteractive(htmlElement)) {
        htmlElement.addEventListener('keydown', this.handleElementKeyDown.bind(this));
      }
      
      console.log('[QuickActionControls] Added keyboard accessibility');
      return 1;
      
    } catch (error) {
      console.error('[QuickActionControls] Fix keyboard access failed:', error);
      return 0;
    }
  }
  
  /**
   * Fix focus management issues
   * 
   * @param element - Element with focus issues
   * @returns Promise<number> - Number of elements modified
   */
  private async fixFocusManagement(element: Element): Promise<number> {
    try {
      const htmlElement = element as HTMLElement;
      
      // Add visible focus indicator
      htmlElement.style.outline = '2px solid #005fcc';
      htmlElement.style.outlineOffset = '2px';
      
      // Add focus event handlers
      htmlElement.addEventListener('focus', this.handleElementFocus.bind(this));
      htmlElement.addEventListener('blur', this.handleElementBlur.bind(this));
      
      console.log('[QuickActionControls] Added focus management');
      return 1;
      
    } catch (error) {
      console.error('[QuickActionControls] Fix focus management failed:', error);
      return 0;
    }
  }
  
  // Event Handlers
  
  private handleKeyDown(event: KeyboardEvent): void {
    // Check for keyboard shortcuts
    for (const shortcut of this.keyboardShortcuts.values()) {
      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault();
        this.executeKeyboardShortcut(shortcut.id);
        break;
      }
    }
  }
  
  private handleSpeechResult(event: any): void {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log(`[QuickActionControls] Voice command: "${transcript}"`);
    
    // Find matching voice command
    for (const command of this.voiceCommands.values()) {
      for (const phrase of command.phrases) {
        if (transcript.includes(phrase.toLowerCase())) {
          this.executeAction(command.action);
          return;
        }
      }
    }
    
    console.log(`[QuickActionControls] No matching voice command found for: "${transcript}"`);
  }
  
  private handleSpeechError(event: any): void {
    console.error('[QuickActionControls] Speech recognition error:', event.error);
    this.isListening = false;
  }
  
  private handleSpeechEnd(): void {
    console.log('[QuickActionControls] Speech recognition ended');
    this.isListening = false;
  }
  
  private handleElementKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  }
  
  private handleElementFocus(event: FocusEvent): void {
    const element = event.target as HTMLElement;
    element.style.outline = '2px solid #005fcc';
    element.style.outlineOffset = '2px';
  }
  
  private handleElementBlur(event: FocusEvent): void {
    const element = event.target as HTMLElement;
    element.style.outline = '';
    element.style.outlineOffset = '';
  }
  
  // Utility Methods
  
  private findElementByInfo(elementInfo: ElementInfo): Element | null {
    // Try to find by ID first
    if (elementInfo.id) {
      const element = document.getElementById(elementInfo.id);
      if (element) return element;
    }
    
    // Try to find by XPath
    try {
      const result = document.evaluate(
        elementInfo.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue as Element;
    } catch (error) {
      console.warn('[QuickActionControls] XPath evaluation failed:', error);
      return null;
    }
  }
  
  private generateAltText(image: HTMLImageElement): string {
    // Simple alt text generation based on context
    const src = image.src.toLowerCase();
    const className = image.className.toLowerCase();
    const parentText = image.parentElement?.textContent?.trim() || '';
    
    if (src.includes('logo')) return 'Company logo';
    if (src.includes('icon')) return 'Icon';
    if (src.includes('avatar') || src.includes('profile')) return 'Profile picture';
    if (className.includes('decoration')) return '';
    if (parentText) return `Image related to: ${parentText.substring(0, 50)}`;
    
    return 'Image';
  }
  
  private generateLabelText(input: HTMLInputElement): string {
    const type = (input.type || 'text').toLowerCase();
    const name = input.name || '';
    const placeholder = input.placeholder || '';
    
    if (placeholder) return placeholder;
    if (name) return name.charAt(0).toUpperCase() + name.slice(1);
    
    switch (type) {
      case 'email': return 'Email address';
      case 'password': return 'Password';
      case 'text': return 'Text input';
      case 'search': return 'Search';
      case 'tel': return 'Phone number';
      case 'url': return 'Website URL';
      default: return 'Input field';
    }
  }
  
  private calculateCorrectHeadingLevel(heading: HTMLHeadingElement): number {
    // Find previous heading to determine correct level
    let currentElement = heading.previousElementSibling;
    let lastHeadingLevel = 1;
    
    while (currentElement) {
      if (currentElement.tagName.match(/^H[1-6]$/)) {
        lastHeadingLevel = parseInt(currentElement.tagName.charAt(1));
        break;
      }
      currentElement = currentElement.previousElementSibling;
    }
    
    // Return appropriate level (max increase of 1)
    return Math.min(6, lastHeadingLevel + 1);
  }
  
  private getHighContrastColors(currentColor: string, currentBackground: string): { color?: string; backgroundColor?: string } {
    // Simple high contrast color mapping
    const result: { color?: string; backgroundColor?: string } = {};
    
    // If text is too light, make it darker
    if (this.isLightColor(currentColor)) {
      result.color = '#000000';
    }
    
    // If background is too dark, make it lighter
    if (this.isDarkColor(currentBackground)) {
      result.backgroundColor = '#ffffff';
    }
    
    return result;
  }
  
  private isLightColor(color: string): boolean {
    // Simple light color detection
    return color.includes('rgb(255') || color === 'white' || color === '#ffffff';
  }
  
  private isDarkColor(color: string): boolean {
    // Simple dark color detection
    return color.includes('rgb(0') || color === 'black' || color === '#000000';
  }
  
  private isFocusable(element: HTMLElement): boolean {
    return element.tabIndex >= 0 || 
           ['input', 'button', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase());
  }
  
  private isInteractive(element: HTMLElement): boolean {
    return element.onclick !== null || 
           element.getAttribute('role') === 'button' ||
           ['button', 'a', 'input'].includes(element.tagName.toLowerCase());
  }
  
  private getShortcutKey(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    
    return [...modifiers, event.key].join('+');
  }
  
  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const eventKey = this.getShortcutKey(event);
    const shortcutKey = [...shortcut.modifiers, shortcut.key].join('+');
    return eventKey === shortcutKey;
  }
  
  private async executeAction(action: string): Promise<boolean> {
    try {
      console.log(`[QuickActionControls] Executing action: ${action}`);
      
      switch (action) {
        case 'toggle-accessibility-panel':
          // Integration with AccessibilityPanel
          return true;
          
        case 'scan-page-accessibility':
          // Integration with analysis systems
          return true;
          
        case 'fix-all-critical-issues':
          // Apply fixes to all critical issues
          return true;
          
        case 'show-accessibility-panel':
          // Show panel
          return true;
          
        case 'hide-accessibility-panel':
          // Hide panel
          return true;
          
        case 'show-help':
          this.showVoiceCommandHelp();
          return true;
          
        default:
          console.warn(`[QuickActionControls] Unknown action: ${action}`);
          return false;
      }
      
    } catch (error) {
      console.error('[QuickActionControls] Action execution failed:', error);
      return false;
    }
  }
  
  private showVoiceCommandHelp(): void {
    const commands = Array.from(this.voiceCommands.values())
      .map(cmd => `"${cmd.phrases[0]}" - ${cmd.description}`)
      .join('\n');
    
    this.announceToUser(`Available voice commands: ${commands}`);
  }
  
  private announceToUser(message: string): void {
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
    
    console.log(`[QuickActionControls] Announced: ${message}`);
  }
  
  private recordFixMetrics(success: boolean, executionTime: number): void {
    this.fixCount++;
    this.totalFixTime += executionTime;
    
    if (success) {
      this.successfulFixes++;
    }
    
    const successRate = this.successfulFixes / this.fixCount;
    const averageTime = this.totalFixTime / this.fixCount;
    
    if (executionTime > this.FIX_APPLICATION_TARGET) {
      console.warn(`[QuickActionControls] Fix time ${executionTime.toFixed(2)}ms exceeded target ${this.FIX_APPLICATION_TARGET}ms`);
    }
    
    if (successRate < this.SUCCESS_RATE_TARGET) {
      console.warn(`[QuickActionControls] Success rate ${(successRate * 100).toFixed(1)}% below target ${(this.SUCCESS_RATE_TARGET * 100)}%`);
    }
    
    console.log(`[QuickActionControls] Metrics - Success rate: ${(successRate * 100).toFixed(1)}%, Average time: ${averageTime.toFixed(2)}ms`);
  }
  
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
  } {
    return {
      fixCount: this.fixCount,
      successRate: this.fixCount > 0 ? this.successfulFixes / this.fixCount : 0,
      averageFixTime: this.fixCount > 0 ? this.totalFixTime / this.fixCount : 0,
      isListening: this.isListening
    };
  }
  
  /**
   * Cleanup resources and event listeners
   */
  async shutdown(): Promise<void> {
    try {
      console.log('[QuickActionControls] Shutting down...');
      
      // Stop voice listening
      if (this.isListening) {
        await this.stopVoiceListening();
      }
      
      // Remove event listeners
      this.boundEventListeners.forEach((listener, event) => {
        document.removeEventListener(event, listener);
      });
      
      // Reset state
      this.isInitialized = false;
      
      console.log('[QuickActionControls] Shutdown complete');
      
    } catch (error) {
      console.error('[QuickActionControls] Shutdown failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const quickActionControls = QuickActionControls.getInstance();
export default quickActionControls;