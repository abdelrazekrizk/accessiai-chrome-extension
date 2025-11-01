/**
 * ContentStructureAnalyzer.ts
 * 
 * Content Structure Analysis System for AccessiAI Chrome Extension
 * Implements comprehensive content structure analysis including:
 * - Heading hierarchy validation and optimization suggestions
 * - Landmark detection and navigation structure analysis
 * - Form accessibility validation with label association checking
 * 
 * Performance Target: <100ms analysis time
 * Accuracy Target: 95% for content structure validation
 * 
 * @version 2.0.0
 * @author AccessiAI Team
 */

import { 
  AccessibilityIssue,
  ContentAnalysisResult,
  ElementInfo,
  AccessibilityIssueType,
  IssueSeverity
} from '../types/index';

/**
 * ContentStructureAnalyzer - Singleton class for content structure accessibility analysis
 * 
 * Provides comprehensive analysis of content structure including heading hierarchy,
 * landmarks, and form accessibility to identify barriers and suggest improvements.
 */
export class ContentStructureAnalyzer {
  private static instance: ContentStructureAnalyzer;
  
  // Core Properties
  private isAnalyzing: boolean = false;
  private analysisStartTime: number = 0;
  
  // Performance Targets
  private readonly ANALYSIS_TIME_TARGET = 100; // milliseconds
  
  // Analysis Counters
  private analysisCount: number = 0;
  private totalAnalysisTime: number = 0;

  /**
   * Get singleton instance of ContentStructureAnalyzer
   */
  static getInstance(): ContentStructureAnalyzer {
    if (!ContentStructureAnalyzer.instance) {
      ContentStructureAnalyzer.instance = new ContentStructureAnalyzer();
    }
    return ContentStructureAnalyzer.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    console.log('[ContentStructureAnalyzer] Initializing Content Structure Analysis System...');
  }

  /**
   * Analyze content structure accessibility in the document
   * 
   * @param document - Document to analyze
   * @returns Promise<ContentAnalysisResult> - Comprehensive content structure analysis results
   */
  async analyzeContentStructure(document: Document): Promise<ContentAnalysisResult> {
    if (this.isAnalyzing) {
      console.warn('[ContentStructureAnalyzer] Analysis already in progress, skipping...');
      return this.createEmptyResult();
    }
    
    this.isAnalyzing = true;
    this.analysisStartTime = performance.now();
    
    try {
      console.log('[ContentStructureAnalyzer] Starting comprehensive content structure analysis...');

      // Parallel analysis of different content structure components
      const [headingIssues, landmarkIssues, formIssues] = await Promise.all([
        this.validateHeadingHierarchy(document),
        this.validateLandmarks(document),
        this.validateFormAccessibility(document)
      ]);

      // Calculate overall score
      const totalIssues = headingIssues.length + landmarkIssues.length + formIssues.length;
      const overallScore = this.calculateOverallScore(totalIssues, document);
      
      const analysisTime = performance.now() - this.analysisStartTime;
      this.recordAnalysisMetrics(analysisTime);

      const result: ContentAnalysisResult = {
        overallScore,
        analysisTime,
        headingIssues,
        landmarkIssues,
        formIssues,
        totalIssues,
        criticalIssues: [...headingIssues, ...landmarkIssues, ...formIssues].filter(issue => issue.severity === 'critical').length,
        warningIssues: [...headingIssues, ...landmarkIssues, ...formIssues].filter(issue => issue.severity === 'high').length,
        infoIssues: [...headingIssues, ...landmarkIssues, ...formIssues].filter(issue => issue.severity === 'low').length,
        timestamp: new Date().toISOString()
      };

      console.log(`[ContentStructureAnalyzer] Analysis completed in ${analysisTime.toFixed(2)}ms`);
      console.log(`[ContentStructureAnalyzer] Found ${totalIssues} content structure issues`);

      return result;

    } catch (error) {
      console.error('[ContentStructureAnalyzer] Analysis failed:', error);
      throw error;
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Validate heading hierarchy for accessibility compliance
   * 
   * @param document - Document containing headings
   * @returns Promise<AccessibilityIssue[]> - Heading hierarchy issues
   */
  private async validateHeadingHierarchy(document: Document): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    if (headings.length === 0) {
      return issues;
    }

    // Check for h1 presence
    const h1Elements = headings.filter(h => h.tagName.toLowerCase() === 'h1');
    if (h1Elements.length === 0) {
      issues.push(await this.createIssue({
        type: 'heading-structure',
        severity: 'medium',
        element: document.body,
        description: 'Page is missing an h1 heading',
        suggestedFix: 'Add an h1 heading to provide the main page title'
      }));
    }

    // Check for multiple h1 elements
    if (h1Elements.length > 1) {
      for (let i = 1; i < h1Elements.length; i++) {
        const h1Element = h1Elements[i];
        if (h1Element) {
          issues.push(await this.createIssue({
            type: 'heading-structure',
            severity: 'low',
            element: h1Element,
            description: 'Multiple h1 headings found on page',
            suggestedFix: 'Use only one h1 per page'
          }));
        }
      }
    }

    // Check heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      if (current && previous) {
        const currentLevel = parseInt(current.tagName.charAt(1));
        const previousLevel = parseInt(previous.tagName.charAt(1));
        
        if (currentLevel > previousLevel + 1) {
          issues.push(await this.createIssue({
            type: 'heading-structure',
            severity: 'medium',
            element: current,
            description: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
            suggestedFix: 'Use sequential heading levels without skipping'
          }));
        }
      }
    }

    return issues;
  }

  /**
   * Validate landmarks for accessibility compliance
   * 
   * @param document - Document containing landmarks
   * @returns Promise<AccessibilityIssue[]> - Landmark validation issues
   */
  private async validateLandmarks(document: Document): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Check for main landmark
    const mainElements = document.querySelectorAll('main, [role="main"]');
    if (mainElements.length === 0) {
      issues.push(await this.createIssue({
        type: 'semantic-markup',
        severity: 'high',
        element: document.body,
        description: 'Page is missing a main landmark',
        suggestedFix: 'Add a <main> element to identify the main content area'
      }));
    }

    // Check for navigation
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    if (navElements.length === 0) {
      issues.push(await this.createIssue({
        type: 'semantic-markup',
        severity: 'medium',
        element: document.body,
        description: 'Page is missing navigation landmarks',
        suggestedFix: 'Add <nav> elements to identify navigation areas'
      }));
    }

    return issues;
  } 
  /**
   * Validate form accessibility compliance
   * 
   * @param document - Document containing forms
   * @returns Promise<AccessibilityIssue[]> - Form accessibility issues
   */
  private async validateFormAccessibility(document: Document): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];
    const forms = Array.from(document.querySelectorAll('form'));

    for (const form of forms) {
      const controls = Array.from(form.querySelectorAll('input, select, textarea'));
      
      for (const control of controls) {
        const id = control.getAttribute('id');
        const ariaLabel = control.getAttribute('aria-label');
        const ariaLabelledBy = control.getAttribute('aria-labelledby');
        
        let hasLabel = false;
        
        // Check for explicit label
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) hasLabel = true;
        }
        
        // Check for implicit label
        if (!hasLabel) {
          const parentLabel = control.closest('label');
          if (parentLabel) hasLabel = true;
        }
        
        // Check for ARIA labeling
        if (!hasLabel && (ariaLabel || ariaLabelledBy)) {
          hasLabel = true;
        }
        
        if (!hasLabel) {
          issues.push(await this.createIssue({
            type: 'missing-labels',
            severity: 'high',
            element: control,
            description: 'Form control is missing a label',
            suggestedFix: 'Add a <label> element or aria-label attribute'
          }));
        }
      }
    }

    return issues;
  }

  /**
   * Create content structure accessibility issue
   * 
   * @param issueData - Issue data
   * @returns Promise<AccessibilityIssue> - Created accessibility issue
   */
  private async createIssue(issueData: {
    type: AccessibilityIssueType;
    severity: IssueSeverity;
    element: Element;
    description: string;
    suggestedFix: string;
  }): Promise<AccessibilityIssue> {
    const elementInfo = this.createElementInfo(issueData.element);

    return {
      id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: issueData.type,
      severity: issueData.severity,
      element: elementInfo,
      description: issueData.description,
      wcagCriteria: this.getWCAGCriteria(issueData.type),
      suggestedFix: issueData.suggestedFix,
      detectedAt: Date.now(),
      confidence: 0.95 // High confidence for content structure analysis
    };
  }

  /**
   * Create element information object
   * 
   * @param element - Element to create info for
   * @returns ElementInfo - Element information
   */
  private createElementInfo(element: Element): ElementInfo {
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
      xpath: this.getXPath(element),
      attributes,
      boundingRect: rect
    };

    if (element.id) (elementInfo as any).id = element.id;
    if (element.className) (elementInfo as any).className = element.className;
    if (element.textContent?.trim()) (elementInfo as any).textContent = element.textContent.trim();

    return elementInfo;
  }

  /**
   * Get XPath for element
   * 
   * @param element - Element to get XPath for
   * @returns string - XPath
   */
  private getXPath(element: Element): string {
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

  /**
   * Get WCAG criteria for issue type
   * 
   * @param issueType - Issue type
   * @returns string[] - WCAG criteria
   */
  private getWCAGCriteria(issueType: AccessibilityIssueType): string[] {
    const criteriaMap: Record<AccessibilityIssueType, string[]> = {
      'missing-alt-text': ['1.1.1'],
      'insufficient-contrast': ['1.4.3'],
      'keyboard-inaccessible': ['2.1.1'],
      'missing-labels': ['1.3.1', '3.3.2'],
      'invalid-aria': ['4.1.2'],
      'heading-structure': ['1.3.1'],
      'focus-management': ['2.4.3'],
      'semantic-markup': ['1.3.1'],
      'color-only-information': ['1.4.1'],
      'text-size': ['1.4.4'],
      'link-purpose': ['2.4.4'],
      'form-validation': ['3.3.1', '3.3.2']
    };

    return criteriaMap[issueType] || ['1.3.1'];
  }

  /**
   * Calculate overall accessibility score
   * 
   * @param totalIssues - Total number of issues found
   * @param document - Document analyzed
   * @returns number - Score from 0-100
   */
  private calculateOverallScore(totalIssues: number, document: Document): number {
    const totalElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, main, nav, form, input, select, textarea').length;
    if (totalElements === 0) return 100;
    
    // Weight different issue types
    const maxPossibleIssues = totalElements * 0.5; // Assume max 0.5 issues per element
    const score = Math.max(0, 100 - (totalIssues / maxPossibleIssues * 100));
    return Math.round(score);
  }
  
  /**
   * Record analysis performance metrics
   * 
   * @param analysisTime - Time taken for analysis
   */
  private recordAnalysisMetrics(analysisTime: number): void {
    this.analysisCount++;
    this.totalAnalysisTime += analysisTime;
    
    const averageTime = this.totalAnalysisTime / this.analysisCount;
    
    if (analysisTime > this.ANALYSIS_TIME_TARGET) {
      console.warn(`[ContentStructureAnalyzer] Analysis time ${analysisTime.toFixed(2)}ms exceeded target ${this.ANALYSIS_TIME_TARGET}ms`);
    }
    
    console.log(`[ContentStructureAnalyzer] Average analysis time: ${averageTime.toFixed(2)}ms`);
  }
  
  /**
   * Create empty result for error cases
   * 
   * @returns ContentAnalysisResult - Empty result
   */
  private createEmptyResult(): ContentAnalysisResult {
    return {
      overallScore: 0,
      analysisTime: 0,
      headingIssues: [],
      landmarkIssues: [],
      formIssues: [],
      totalIssues: 0,
      criticalIssues: 0,
      warningIssues: 0,
      infoIssues: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Shutdown the analyzer
   */
  async shutdown(): Promise<void> {
    console.log('[ContentStructureAnalyzer] Shutdown complete');
  }
}

export const contentStructureAnalyzer = ContentStructureAnalyzer.getInstance();
export default contentStructureAnalyzer;