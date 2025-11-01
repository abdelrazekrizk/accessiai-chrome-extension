/**
 * AccessiAI Accessibility Scanner - WCAG Compliance Issue Detection
 * WCAG 2.1 AA compliance scanning with color contrast and keyboard accessibility
 * Provides comprehensive accessibility analysis with automated issue detection
 * Target: <100ms analysis time with 95% accuracy
 */

import type {
  AccessibilityIssue,
  AccessibilityIssueType,
  AccessibilityAnalysis,
  IssueSeverity,
  ElementInfo,
  WCAGCriteria,
  ComplianceResult,
  ComplianceStatus
} from '../types/index';



// ============================================================================
// ACCESSIBILITY SCANNER INTERFACES
// ============================================================================

export interface AccessibilityScannerConfig {
  readonly enableColorContrastCheck: boolean;
  readonly enableKeyboardAccessibilityCheck: boolean;
  readonly enableARIAValidation: boolean;
  readonly enableFormValidation: boolean;
  readonly wcagLevel: 'A' | 'AA' | 'AAA';
  readonly maxScanTime: number;                    // milliseconds
  readonly minContrastRatio: number;               // 4.5 for AA, 3.0 for large text
  readonly includeHiddenElements: boolean;
}

export interface ScanOptions {
  readonly targetElements?: Element[];
  readonly skipElements?: string[];               // CSS selectors to skip
  readonly focusAreas?: AccessibilityIssueType[];
  readonly includeWarnings: boolean;
  readonly generateSuggestions: boolean;
}

export interface ColorContrastResult {
  readonly foregroundColor: string;
  readonly backgroundColor: string;
  readonly contrastRatio: number;
  readonly wcagLevel: 'A' | 'AA' | 'AAA' | 'fail';
  readonly isLargeText: boolean;
  readonly passes: boolean;
}

export interface KeyboardAccessibilityResult {
  readonly isFocusable: boolean;
  readonly hasProperTabIndex: boolean;
  readonly hasKeyboardHandlers: boolean;
  readonly hasVisibleFocus: boolean;
  readonly isInTabOrder: boolean;
  readonly issues: string[];
}

// ============================================================================
// ACCESSIBILITY SCANNER IMPLEMENTATION
// ============================================================================

export class AccessibilityScanner {
  // ============================================================================
  // CORE PROPERTIES
  // ============================================================================

  private isScanning: boolean = false;
  private scanStartTime: number = 0;
  private detectedIssues: AccessibilityIssue[] = [];
  private processedElements: number = 0;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private config: AccessibilityScannerConfig = {
    enableColorContrastCheck: true,
    enableKeyboardAccessibilityCheck: true,
    enableARIAValidation: true,
    enableFormValidation: true,
    wcagLevel: 'AA',
    maxScanTime: 100,                    // Performance target for real-time analysis
    minContrastRatio: 4.5,               // WCAG AA standard
    includeHiddenElements: false
  };

  // Performance targets for optimal user experience
  private readonly SCAN_TIME_TARGET = 100;        // milliseconds

  // WCAG 2.1 AA Criteria definitions
  private readonly WCAG_CRITERIA: Record<string, WCAGCriteria> = {
    '1.1.1': {
      id: '1.1.1',
      level: 'A',
      principle: 'perceivable',
      guideline: 'Provide text alternatives for non-text content',
      description: 'All non-text content has a text alternative',
      successCriteria: 'Non-text Content'
    },
    '1.4.3': {
      id: '1.4.3',
      level: 'AA',
      principle: 'perceivable',
      guideline: 'Make it easier for users to see and hear content',
      description: 'Color contrast of at least 4.5:1 for normal text',
      successCriteria: 'Contrast (Minimum)'
    },
    '2.1.1': {
      id: '2.1.1',
      level: 'A',
      principle: 'operable',
      guideline: 'Make all functionality available from a keyboard',
      description: 'All functionality is available from a keyboard',
      successCriteria: 'Keyboard'
    },
    '4.1.2': {
      id: '4.1.2',
      level: 'A',
      principle: 'robust',
      guideline: 'Maximize compatibility with assistive technologies',
      description: 'Name, role, value can be programmatically determined',
      successCriteria: 'Name, Role, Value'
    }
  };

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  private static instance: AccessibilityScanner | null = null;

  static getInstance(): AccessibilityScanner {
    if (!AccessibilityScanner.instance) {
      AccessibilityScanner.instance = new AccessibilityScanner();
    }
    return AccessibilityScanner.instance;
  }

  private constructor() {
    console.log('[AccessibilityScanner] Initialized with WCAG 2.1 AA compliance scanning');
  }

  // ============================================================================
  // CORE SCANNING METHODS
  // ============================================================================

  async scanPage(document: Document, options?: ScanOptions): Promise<AccessibilityAnalysis> {
    try {
      this.scanStartTime = performance.now();
      this.isScanning = true;
      this.detectedIssues = [];
      this.processedElements = 0;

      console.log('[AccessibilityScanner] Starting WCAG 2.1 AA compliance scan...');

      const scanOptions: ScanOptions = {
        includeWarnings: true,
        generateSuggestions: true,
        ...options
      };

      // Get all elements to scan
      const elementsToScan = this.getElementsToScan(document, scanOptions);
      console.log(`[AccessibilityScanner] Scanning ${elementsToScan.length} elements`);

      // Perform parallel scanning for better performance
      await Promise.all([
        this.scanForMissingAltText(elementsToScan),
        this.scanForColorContrastIssues(elementsToScan),
        this.scanForKeyboardAccessibilityIssues(elementsToScan),
        this.scanForARIAIssues(elementsToScan),
        this.scanForFormAccessibilityIssues(elementsToScan),
        this.scanForHeadingStructureIssues(document),
        this.scanForFocusManagementIssues(elementsToScan)
      ]);

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(this.detectedIssues, elementsToScan.length);
      
      const scanTime = performance.now() - this.scanStartTime;
      console.log(`[AccessibilityScanner] Scan completed in ${scanTime.toFixed(2)}ms`);
      console.log(`[AccessibilityScanner] Found ${this.detectedIssues.length} accessibility issues`);

      // Check performance target
      if (scanTime > this.SCAN_TIME_TARGET) {
        console.warn(`[AccessibilityScanner] Scan time exceeded target: ${scanTime.toFixed(2)}ms > ${this.SCAN_TIME_TARGET}ms`);
      }

      const analysis: AccessibilityAnalysis = {
        pageUrl: document.location?.href || document.URL || 'unknown',
        analyzedAt: Date.now(),
        issues: [...this.detectedIssues],
        complianceScore,
        totalElements: elementsToScan.length,
        processedElements: this.processedElements,
        analysisTime: scanTime
      };

      return analysis;

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan page:', error);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  // ============================================================================
  // WCAG 2.1 AA COMPLIANCE SCANNING
  // ============================================================================

  private async scanForMissingAltText(elements: Element[]): Promise<void> {
    try {
      const images = elements.filter(el => el.tagName.toLowerCase() === 'img') as HTMLImageElement[];
      
      for (const img of images) {
        this.processedElements++;
        
        const alt = img.getAttribute('alt');
        const role = img.getAttribute('role');
        const ariaLabel = img.getAttribute('aria-label');
        const ariaLabelledBy = img.getAttribute('aria-labelledby');
        
        // Skip decorative images
        if (role === 'presentation' || role === 'none' || alt === '') {
          continue;
        }

        // Check for missing alt text
        if (!alt && !ariaLabel && !ariaLabelledBy) {
          await this.createIssue({
            type: 'missing-alt-text',
            severity: 'high',
            element: img,
            description: 'Image is missing alternative text',
            wcagCriteria: ['1.1.1'],
            suggestedFix: 'Add descriptive alt attribute to the image'
          });
        }

        // Check for poor alt text
        if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture') || alt.length < 3)) {
          await this.createIssue({
            type: 'missing-alt-text',
            severity: 'medium',
            element: img,
            description: 'Image has poor quality alternative text',
            wcagCriteria: ['1.1.1'],
            suggestedFix: 'Improve alt text to be more descriptive and meaningful'
          });
        }
      }

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan for missing alt text:', error);
    }
  }

  private async scanForColorContrastIssues(elements: Element[]): Promise<void> {
    if (!this.config.enableColorContrastCheck) return;

    try {
      const textElements = elements.filter(el => {
        const tagName = el.tagName.toLowerCase();
        return ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'label'].includes(tagName);
      });

      for (const element of textElements) {
        this.processedElements++;
        
        const textContent = element.textContent?.trim();
        if (!textContent || textContent.length === 0) continue;

        const contrastResult = await this.analyzeColorContrast(element);
        
        if (!contrastResult.passes) {
          const severity: IssueSeverity = contrastResult.contrastRatio < 3.0 ? 'critical' : 'high';
          
          await this.createIssue({
            type: 'insufficient-contrast',
            severity,
            element,
            description: `Text has insufficient color contrast ratio: ${contrastResult.contrastRatio.toFixed(2)}:1`,
            wcagCriteria: ['1.4.3'],
            suggestedFix: `Increase contrast ratio to at least ${this.config.minContrastRatio}:1 for WCAG AA compliance`
          });
        }
      }

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan for color contrast issues:', error);
    }
  }

  private async scanForKeyboardAccessibilityIssues(elements: Element[]): Promise<void> {
    if (!this.config.enableKeyboardAccessibilityCheck) return;

    try {
      const interactiveElements = elements.filter(el => this.isInteractiveElement(el));

      for (const element of interactiveElements) {
        this.processedElements++;
        
        const keyboardResult = this.analyzeKeyboardAccessibility(element);
        
        if (!keyboardResult.isFocusable && this.shouldBeFocusable(element)) {
          await this.createIssue({
            type: 'keyboard-inaccessible',
            severity: 'high',
            element,
            description: 'Interactive element is not keyboard accessible',
            wcagCriteria: ['2.1.1'],
            suggestedFix: 'Add tabindex="0" or ensure element is naturally focusable'
          });
        }

        if (!keyboardResult.hasVisibleFocus) {
          await this.createIssue({
            type: 'focus-management',
            severity: 'medium',
            element,
            description: 'Element lacks visible focus indicator',
            wcagCriteria: ['2.4.7'],
            suggestedFix: 'Add CSS :focus styles to provide visible focus indication'
          });
        }

        if (keyboardResult.issues.length > 0) {
          for (const issue of keyboardResult.issues) {
            await this.createIssue({
              type: 'keyboard-inaccessible',
              severity: 'medium',
              element,
              description: issue,
              wcagCriteria: ['2.1.1'],
              suggestedFix: 'Review keyboard interaction patterns and ensure proper implementation'
            });
          }
        }
      }

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan for keyboard accessibility issues:', error);
    }
  }

  private async scanForARIAIssues(elements: Element[]): Promise<void> {
    if (!this.config.enableARIAValidation) return;

    try {
      const elementsWithARIA = elements.filter(el => this.hasARIAAttributes(el));

      for (const element of elementsWithARIA) {
        this.processedElements++;
        
        const ariaIssues = this.validateARIAImplementation(element);
        
        for (const issue of ariaIssues) {
          await this.createIssue({
            type: 'invalid-aria',
            severity: issue.severity,
            element,
            description: issue.description,
            wcagCriteria: ['4.1.2'],
            suggestedFix: issue.suggestedFix
          });
        }
      }

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan for ARIA issues:', error);
    }
  }

  private async scanForFormAccessibilityIssues(elements: Element[]): Promise<void> {
    if (!this.config.enableFormValidation) return;

    try {
      const formElements = elements.filter(el => this.isFormElement(el));

      for (const element of formElements) {
        this.processedElements++;
        
        const formIssues = this.validateFormAccessibility(element);
        
        for (const issue of formIssues) {
          await this.createIssue({
            type: 'missing-labels',
            severity: issue.severity,
            element,
            description: issue.description,
            wcagCriteria: ['1.3.1', '3.3.2'],
            suggestedFix: issue.suggestedFix
          });
        }
      }

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan for form accessibility issues:', error);
    }
  }

  private async scanForHeadingStructureIssues(document: Document): Promise<void> {
    try {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      
      if (headings.length === 0) return;

      // Check for missing h1
      const h1Elements = headings.filter(h => h.tagName.toLowerCase() === 'h1');
      if (h1Elements.length === 0) {
        await this.createIssue({
          type: 'heading-structure',
          severity: 'medium',
          element: document.body,
          description: 'Page is missing an h1 heading',
          wcagCriteria: ['1.3.1'],
          suggestedFix: 'Add an h1 heading to provide the main page title'
        });
      }

      // Check for multiple h1 elements
      if (h1Elements.length > 1) {
        for (let i = 1; i < h1Elements.length; i++) {
          const h1Element = h1Elements[i];
          if (h1Element) {
            await this.createIssue({
              type: 'heading-structure',
              severity: 'low',
              element: h1Element,
              description: 'Multiple h1 headings found on page',
              wcagCriteria: ['1.3.1'],
              suggestedFix: 'Use only one h1 per page, use h2-h6 for subheadings'
            });
          }
        }
      }

      // Check heading hierarchy
      for (let i = 1; i < headings.length; i++) {
        const currentHeading = headings[i];
        const previousHeading = headings[i - 1];
        
        if (currentHeading && previousHeading) {
          const currentLevel = parseInt(currentHeading.tagName.charAt(1));
          const previousLevel = parseInt(previousHeading.tagName.charAt(1));
          
          if (currentLevel > previousLevel + 1) {
            await this.createIssue({
              type: 'heading-structure',
              severity: 'medium',
              element: currentHeading,
              description: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
              wcagCriteria: ['1.3.1'],
              suggestedFix: 'Use sequential heading levels without skipping'
            });
          }
        }
      }

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan for heading structure issues:', error);
    }
  }

  private async scanForFocusManagementIssues(elements: Element[]): Promise<void> {
    try {
      const focusableElements = elements.filter(el => this.isFocusable(el));
      
      for (const element of focusableElements) {
        this.processedElements++;
        
        const tabIndex = element.getAttribute('tabindex');
        
        // Check for positive tabindex values (anti-pattern)
        if (tabIndex && parseInt(tabIndex) > 0) {
          await this.createIssue({
            type: 'focus-management',
            severity: 'medium',
            element,
            description: 'Positive tabindex values can disrupt natural tab order',
            wcagCriteria: ['2.4.3'],
            suggestedFix: 'Use tabindex="0" or rely on natural tab order instead of positive values'
          });
        }
      }

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to scan for focus management issues:', error);
    }
  }

  // ============================================================================
  // COLOR CONTRAST ANALYSIS
  // ============================================================================

  private async analyzeColorContrast(element: Element): Promise<ColorContrastResult> {
    try {
      const styles = window.getComputedStyle(element);
      const foregroundColor = styles.color;
      const backgroundColor = this.getEffectiveBackgroundColor(element);
      
      const contrastRatio = this.calculateContrastRatio(foregroundColor || 'rgb(0,0,0)', backgroundColor || 'rgb(255,255,255)');
      const isLargeText = this.isLargeText(element, styles);
      
      // WCAG AA requirements: 4.5:1 for normal text, 3:1 for large text
      const requiredRatio = isLargeText ? 3.0 : 4.5;
      const passes = contrastRatio >= requiredRatio;
      
      let wcagLevel: 'A' | 'AA' | 'AAA' | 'fail' = 'fail';
      if (contrastRatio >= (isLargeText ? 4.5 : 7.0)) wcagLevel = 'AAA';
      else if (contrastRatio >= requiredRatio) wcagLevel = 'AA';
      else if (contrastRatio >= (isLargeText ? 3.0 : 4.5)) wcagLevel = 'A';

      return {
        foregroundColor,
        backgroundColor,
        contrastRatio,
        wcagLevel,
        isLargeText,
        passes
      };

    } catch (error) {
      console.error('[AccessibilityScanner] Failed to analyze color contrast:', error);
      return {
        foregroundColor: 'unknown',
        backgroundColor: 'unknown',
        contrastRatio: 0,
        wcagLevel: 'fail',
        isLargeText: false,
        passes: false
      };
    }
  }

  // ============================================================================
  // KEYBOARD ACCESSIBILITY VALIDATION
  // ============================================================================

  private analyzeKeyboardAccessibility(element: Element): KeyboardAccessibilityResult {
    const isFocusable = this.isFocusable(element);
    const hasProperTabIndex = this.hasProperTabIndex(element);
    const hasKeyboardHandlers = this.hasKeyboardEventHandlers(element);
    const hasVisibleFocus = this.hasVisibleFocusStyles(element);
    const isInTabOrder = this.isInTabOrder(element);
    
    const issues: string[] = [];
    
    if (this.shouldBeFocusable(element) && !isFocusable) {
      issues.push('Interactive element is not focusable');
    }
    
    if (isFocusable && !hasVisibleFocus) {
      issues.push('Focusable element lacks visible focus indicator');
    }
    
    if (this.requiresKeyboardHandlers(element) && !hasKeyboardHandlers) {
      issues.push('Interactive element lacks keyboard event handlers');
    }

    return {
      isFocusable,
      hasProperTabIndex,
      hasKeyboardHandlers,
      hasVisibleFocus,
      isInTabOrder,
      issues
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getElementsToScan(document: Document, options: ScanOptions): Element[] {
    let elements: Element[];
    
    if (options.targetElements) {
      elements = options.targetElements;
    } else {
      elements = Array.from(document.querySelectorAll('*'));
    }

    // Filter out elements to skip
    if (options.skipElements) {
      const skipSelectors = options.skipElements.join(', ');
      const elementsToSkip = new Set(Array.from(document.querySelectorAll(skipSelectors)));
      elements = elements.filter(el => !elementsToSkip.has(el));
    }

    // Filter hidden elements if configured
    if (!this.config.includeHiddenElements) {
      elements = elements.filter(el => this.isElementVisible(el));
    }

    return elements;
  }

  private async createIssue(issueData: {
    type: AccessibilityIssueType;
    severity: IssueSeverity;
    element: Element;
    description: string;
    wcagCriteria: string[];
    suggestedFix: string;
  }): Promise<void> {
    const elementInfo = await this.createElementInfo(issueData.element);

    const issue: AccessibilityIssue = {
      id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: issueData.type,
      severity: issueData.severity,
      element: elementInfo,
      description: issueData.description,
      wcagCriteria: issueData.wcagCriteria,
      suggestedFix: issueData.suggestedFix,
      detectedAt: Date.now(),
      confidence: this.calculateConfidence(issueData.type, issueData.element)
    };

    this.detectedIssues.push(issue);
  }

  private createBasicElementInfo(element: Element): ElementInfo {
    const rect = element.getBoundingClientRect();
    const attributes: Record<string, string> = {};

    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr) {
        attributes[attr.name] = attr.value;
      }
    }

    const elementInfo: ElementInfo = {
      tagName: element.tagName.toLowerCase(),
      xpath: this.getSimpleXPath(element),
      attributes,
      boundingRect: rect
    };

    if (element.id) {
      (elementInfo as any).id = element.id;
    }
    if (element.className) {
      (elementInfo as any).className = element.className;
    }
    if (element.textContent?.trim()) {
      (elementInfo as any).textContent = element.textContent.trim();
    }

    return elementInfo;
  }

  private async createElementInfo(element: Element): Promise<ElementInfo> {
    // Always use basic element info since DOMAnalyzer method is private
    return this.createBasicElementInfo(element);
  }

  private getSimpleXPath(element: Element): string {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    const tagName = element.tagName.toLowerCase();
    let index = 1;
    let sibling = element.previousElementSibling;
    
    while (sibling) {
      if (sibling.tagName.toLowerCase() === tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }
    
    return `//${tagName}[${index}]`;
  }

  private calculateComplianceScore(issues: AccessibilityIssue[], totalElements: number): number {
    if (totalElements === 0) return 100;
    
    const weightedIssues = issues.reduce((sum, issue) => {
      const weight = this.getSeverityWeight(issue.severity);
      return sum + weight;
    }, 0);
    
    const maxPossibleScore = totalElements * 4; // Assuming critical = 4 weight
    const score = Math.max(0, 100 - (weightedIssues / maxPossibleScore) * 100);
    
    return Math.round(score);
  }

  private getSeverityWeight(severity: IssueSeverity): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[severity] || 1;
  }

  private calculateConfidence(type: AccessibilityIssueType, _element: Element): number {
    // Simple confidence calculation - can be enhanced
    const baseConfidence = 0.8;
    
    // Higher confidence for clear-cut issues
    if (type === 'missing-alt-text' || type === 'missing-labels') {
      return 0.95;
    }
    
    // Lower confidence for subjective issues
    if (type === 'insufficient-contrast') {
      return 0.85;
    }
    
    return baseConfidence;
  }

  // ============================================================================
  // ELEMENT ANALYSIS HELPERS
  // ============================================================================

  private isInteractiveElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    
    return interactiveTags.includes(tagName) ||
           element.hasAttribute('onclick') ||
           element.hasAttribute('role') && ['button', 'link', 'menuitem'].includes(element.getAttribute('role')!) ||
           element.hasAttribute('tabindex');
  }

  private shouldBeFocusable(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    const focusableTags = ['button', 'input', 'select', 'textarea', 'a'];
    
    return focusableTags.includes(tagName) ||
           element.getAttribute('role') === 'button' ||
           element.hasAttribute('onclick');
  }

  private isFocusable(element: Element): boolean {
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex === '-1') return false;
    
    const tagName = element.tagName.toLowerCase();
    const naturallyFocusable = ['button', 'input', 'select', 'textarea', 'a'];
    
    return naturallyFocusable.includes(tagName) || 
           (tabIndex !== null && parseInt(tabIndex) >= 0);
  }

  private hasProperTabIndex(element: Element): boolean {
    const tabIndex = element.getAttribute('tabindex');
    return tabIndex === null || tabIndex === '0' || parseInt(tabIndex) === -1;
  }

  private hasKeyboardEventHandlers(element: Element): boolean {
    const events = ['onkeydown', 'onkeyup', 'onkeypress'];
    return events.some(event => element.hasAttribute(event));
  }

  private hasVisibleFocusStyles(element: Element): boolean {
    // This is a simplified check - in practice, would need to analyze CSS
    const styles = window.getComputedStyle(element);
    return styles.outline !== 'none' && styles.outline !== '0';
  }

  private isInTabOrder(element: Element): boolean {
    const tabIndex = element.getAttribute('tabindex');
    return tabIndex !== '-1';
  }

  private requiresKeyboardHandlers(element: Element): boolean {
    const role = element.getAttribute('role');
    return role === 'button' || 
           element.hasAttribute('onclick') ||
           element.tagName.toLowerCase() === 'div' && element.hasAttribute('tabindex');
  }

  private hasARIAAttributes(element: Element): boolean {
    return Array.from(element.attributes).some(attr => 
      attr.name.startsWith('aria-') || attr.name === 'role'
    );
  }

  private isFormElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    return ['input', 'select', 'textarea'].includes(tagName);
  }

  private isElementVisible(element: Element): boolean {
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return styles.display !== 'none' &&
           styles.visibility !== 'hidden' &&
           styles.opacity !== '0' &&
           rect.width > 0 &&
           rect.height > 0;
  }

  // ============================================================================
  // COLOR CONTRAST CALCULATIONS
  // ============================================================================

  private calculateContrastRatio(foreground: string, background: string): number {
    try {
      const fgLuminance = this.getRelativeLuminance(foreground);
      const bgLuminance = this.getRelativeLuminance(background);
      
      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);
      
      return (lighter + 0.05) / (darker + 0.05);
    } catch (error) {
      return 1; // Default to failing ratio
    }
  }

  private getRelativeLuminance(color: string): number {
    const rgb = this.parseColor(color);
    const normalizedRgb = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    const r = normalizedRgb[0] || 0;
    const g = normalizedRgb[1] || 0;
    const b = normalizedRgb[2] || 0;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private parseColor(color: string): [number, number, number] {
    // Simple color parsing - can be enhanced for more formats
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return [parseInt(matches[0] || '0'), parseInt(matches[1] || '0'), parseInt(matches[2] || '0')];
      }
    }
    
    // Default to black if parsing fails
    return [0, 0, 0];
  }

  private getEffectiveBackgroundColor(element: Element): string {
    let current: Element | null = element;
    
    while (current) {
      const styles = window.getComputedStyle(current);
      const bgColor = styles.backgroundColor;
      
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return bgColor;
      }
      
      current = current.parentElement;
    }
    
    return 'rgb(255, 255, 255)'; // Default to white
  }

  private isLargeText(_element: Element, styles: CSSStyleDeclaration): boolean {
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;
    
    // WCAG definition: 18pt+ or 14pt+ bold
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
    
    return isLarge;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  private validateARIAImplementation(element: Element): Array<{
    severity: IssueSeverity;
    description: string;
    suggestedFix: string;
  }> {
    const issues: Array<{
      severity: IssueSeverity;
      description: string;
      suggestedFix: string;
    }> = [];

    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');

    // Check for invalid roles
    if (role && !this.isValidARIARole(role)) {
      issues.push({
        severity: 'high',
        description: `Invalid ARIA role: ${role}`,
        suggestedFix: 'Use a valid ARIA role or remove the role attribute'
      });
    }

    // Check for missing accessible names
    if (this.requiresAccessibleName(element) && !ariaLabel && !ariaLabelledBy && !element.textContent?.trim()) {
      issues.push({
        severity: 'high',
        description: 'Element requires an accessible name',
        suggestedFix: 'Add aria-label, aria-labelledby, or text content'
      });
    }

    return issues;
  }

  private validateFormAccessibility(element: Element): Array<{
    severity: IssueSeverity;
    description: string;
    suggestedFix: string;
  }> {
    const issues: Array<{
      severity: IssueSeverity;
      description: string;
      suggestedFix: string;
    }> = [];

    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
      const id = element.getAttribute('id');
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      
      // Check for associated label
      let hasLabel = false;
      if (id) {
        hasLabel = document.querySelector(`label[for="${id}"]`) !== null;
      }
      
      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          severity: 'high',
          description: 'Form control is missing a label',
          suggestedFix: 'Add a <label> element or aria-label attribute'
        });
      }
    }

    return issues;
  }

  private isValidARIARole(role: string): boolean {
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'definition', 'dialog', 'directory', 'document',
      'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link',
      'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math',
      'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
      'navigation', 'note', 'option', 'presentation', 'progressbar',
      'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader',
      'scrollbar', 'search', 'separator', 'slider', 'spinbutton', 'status',
      'tab', 'tablist', 'tabpanel', 'textbox', 'timer', 'toolbar',
      'tooltip', 'tree', 'treegrid', 'treeitem'
    ];
    
    return validRoles.includes(role);
  }

  private requiresAccessibleName(_element: Element): boolean {
    const role = _element.getAttribute('role');
    const tagName = _element.tagName.toLowerCase();
    
    const requiresName = ['button', 'link', 'menuitem', 'tab', 'option'];
    
    return requiresName.includes(role || '') || 
           ['button', 'a'].includes(tagName);
  }

  // ============================================================================
  // CONFIGURATION AND LIFECYCLE
  // ============================================================================

  async updateConfig(newConfig: Partial<AccessibilityScannerConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    console.log('[AccessibilityScanner] Configuration updated');
  }

  getConfig(): AccessibilityScannerConfig {
    return { ...this.config };
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  async validateWCAGCompliance(_element: Element, criteria: string): Promise<ComplianceResult> {
    const wcagCriteria = this.WCAG_CRITERIA[criteria];
    if (!wcagCriteria) {
      throw new Error(`Unknown WCAG criteria: ${criteria}`);
    }

    // Perform specific validation based on criteria
    const issues: AccessibilityIssue[] = [];
    let status: ComplianceStatus = 'pass';
    let score = 1.0;

    // This would contain specific validation logic for each WCAG criteria
    // For now, return a basic result
    
    return {
      criteria: wcagCriteria,
      status,
      score,
      issues,
      recommendations: []
    };
  }

  // ============================================================================
  // CLEANUP AND SHUTDOWN
  // ============================================================================

  async shutdown(): Promise<void> {
    try {
      console.log('[AccessibilityScanner] Shutting down accessibility scanner...');

      // Wait for current scan to complete
      while (this.isScanning) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      this.detectedIssues = [];
      this.processedElements = 0;

      console.log('[AccessibilityScanner] Accessibility scanner shutdown complete');

    } catch (error) {
      console.error('[AccessibilityScanner] Error during accessibility scanner shutdown:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const accessibilityScanner = AccessibilityScanner.getInstance();
export default accessibilityScanner;