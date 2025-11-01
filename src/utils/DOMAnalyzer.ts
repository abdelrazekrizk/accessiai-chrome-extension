/**
 * AccessiAI DOM Analyzer - DOM Analysis Engine
 * Comprehensive DOM tree analysis with accessibility focus
 * Provides real-time DOM structure analysis and accessibility validation
 */

import type {
  PageContext,
  DOMAnalysisResult,
  PageStructure,
  ElementInfo,
  HeadingInfo,
  LandmarkInfo,
  FocusableElementInfo,
  SemanticStructure,
  ViewportInfo,
  AnalysisPerformance,
  AccessibilityAnalysis
} from '../types/index';

// ============================================================================
// DOM ANALYZER INTERFACES
// ============================================================================

export interface DOMAnalyzerConfig {
  readonly enableDeepAnalysis: boolean;
  readonly maxAnalysisTime: number;          // milliseconds
  readonly includeHiddenElements: boolean;
  readonly enablePerformanceMetrics: boolean;
  readonly semanticAnalysisDepth: number;
}

export interface AnalysisOptions {
  readonly includeStructure: boolean;
  readonly includeAccessibility: boolean;
  readonly includePerformance: boolean;
  readonly maxDepth?: number;
  readonly targetElements?: string[];        // CSS selectors
}

export interface DOMTraversalResult {
  readonly totalElements: number;
  readonly processedElements: number;
  readonly skippedElements: number;
  readonly traversalTime: number;           // milliseconds
  readonly errors: string[];
}

// ============================================================================
// DOM ANALYZER IMPLEMENTATION
// ============================================================================

export class DOMAnalyzer {
  // ============================================================================
  // CORE PROPERTIES
  // ============================================================================

  private isAnalyzing: boolean = false;
  private analysisStartTime: number = 0;
  private currentDocument: Document | null = null;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private config: DOMAnalyzerConfig = {
    enableDeepAnalysis: true,
    maxAnalysisTime: 100,              // 100ms target for real-time analysis
    includeHiddenElements: false,
    enablePerformanceMetrics: true,
    semanticAnalysisDepth: 10
  };

  // Performance targets for optimal user experience
  private readonly ANALYSIS_TIME_TARGET = 100; // milliseconds

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  private static instance: DOMAnalyzer | null = null;

  static getInstance(): DOMAnalyzer {
    if (!DOMAnalyzer.instance) {
      DOMAnalyzer.instance = new DOMAnalyzer();
    }
    return DOMAnalyzer.instance;
  }

  private constructor() {
    console.log('[DOMAnalyzer] Initialized with performance optimization');
  }

  // ============================================================================
  // CORE ANALYSIS METHODS
  // ============================================================================

  async analyzePage(document: Document, options?: AnalysisOptions): Promise<DOMAnalysisResult> {
    try {
      this.analysisStartTime = performance.now();
      this.isAnalyzing = true;
      this.currentDocument = document;

      console.log('[DOMAnalyzer] Starting comprehensive DOM analysis...');

      const analysisOptions: AnalysisOptions = {
        includeStructure: true,
        includeAccessibility: true,
        includePerformance: true,
        ...options
      };

      // Perform parallel analysis for better performance
      const [structure, accessibility, performanceMetrics] = await Promise.all([
        analysisOptions.includeStructure ? this.analyzePageStructure(document) : Promise.resolve(this.getEmptyPageStructure()),
        analysisOptions.includeAccessibility ? this.analyzeAccessibility(document) : Promise.resolve(this.getEmptyAccessibilityAnalysis()),
        analysisOptions.includePerformance ? this.measureAnalysisPerformance() : Promise.resolve(this.getEmptyPerformanceMetrics())
      ]);

      const result: DOMAnalysisResult = {
        structure,
        accessibility,
        performance: performanceMetrics
      };

      const analysisTime = performance.now() - this.analysisStartTime;
      console.log(`[DOMAnalyzer] Analysis completed in ${analysisTime.toFixed(2)}ms`);

      // Check performance target
      if (analysisTime > this.ANALYSIS_TIME_TARGET) {
        console.warn(`[DOMAnalyzer] Analysis time exceeded target: ${analysisTime.toFixed(2)}ms > ${this.ANALYSIS_TIME_TARGET}ms`);
      }

      return result;

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to analyze page:', error);
      throw error;
    } finally {
      this.isAnalyzing = false;
      this.currentDocument = null;
    }
  }

  async createPageContext(document: Document): Promise<PageContext> {
    try {
      const url = document.location?.href || document.URL || 'unknown';
      const title = document.title || 'Untitled';
      const viewport = this.getViewportInfo();

      // Get interactive elements
      const interactiveElements = this.getInteractiveElements(document);
      const images = Array.from(document.querySelectorAll('img'));
      const forms = Array.from(document.querySelectorAll('form'));
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const links = Array.from(document.querySelectorAll('a[href]'));

      const pageContext: PageContext = {
        url,
        title,
        dom: document,
        viewport,
        styles: window.getComputedStyle(document.documentElement),
        interactiveElements,
        images,
        forms,
        headings: headings as HTMLHeadingElement[],
        links: links as HTMLAnchorElement[],
        analyzedAt: Date.now()
      };

      console.log(`[DOMAnalyzer] Created page context for: ${title}`);
      return pageContext;

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to create page context:', error);
      throw error;
    }
  }

  // ============================================================================
  // DOM STRUCTURE ANALYSIS
  // ============================================================================

  private async analyzePageStructure(document: Document): Promise<PageStructure> {
    try {
      console.log('[DOMAnalyzer] Analyzing page structure...');

      // Parallel structure analysis for performance
      const [headingHierarchy, landmarks, focusableElements, semanticStructure] = await Promise.all([
        this.analyzeHeadingHierarchy(document),
        this.analyzeLandmarks(document),
        this.analyzeFocusableElements(document),
        this.analyzeSemanticStructure(document)
      ]);

      return {
        headingHierarchy,
        landmarks,
        focusableElements,
        semanticStructure
      };

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to analyze page structure:', error);
      throw error;
    }
  }

  private async analyzeHeadingHierarchy(document: Document): Promise<HeadingInfo[]> {
    try {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const hierarchy: HeadingInfo[] = [];
      const stack: HeadingInfo[] = [];

      for (const heading of headings) {
        const level = parseInt(heading.tagName.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
        const text = heading.textContent?.trim() || '';
        const element = this.createElementInfo(heading);

        const headingInfo: HeadingInfo = {
          level,
          text,
          element,
          children: []
        };

        // Build hierarchy based on heading levels
        while (stack.length > 0) {
          const lastItem = stack[stack.length - 1];
          if (lastItem && lastItem.level >= level) {
            stack.pop();
          } else {
            break;
          }
        }

        if (stack.length === 0) {
          hierarchy.push(headingInfo);
        } else {
          const parent = stack[stack.length - 1];
          if (parent) {
            (parent.children as HeadingInfo[]).push(headingInfo);
          }
        }

        if (headingInfo) {
          stack.push(headingInfo);
        }
      }

      console.log(`[DOMAnalyzer] Analyzed ${headings.length} headings in hierarchy`);
      return hierarchy;

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to analyze heading hierarchy:', error);
      return [];
    }
  }

  private async analyzeLandmarks(document: Document): Promise<LandmarkInfo[]> {
    try {
      const landmarkSelectors = [
        'main, [role="main"]',
        'nav, [role="navigation"]',
        'header, [role="banner"]',
        'footer, [role="contentinfo"]',
        'aside, [role="complementary"]',
        'section, [role="region"]',
        '[role="search"]',
        '[role="form"]'
      ];

      const landmarks: LandmarkInfo[] = [];

      for (const selector of landmarkSelectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        
        for (const element of elements) {
          const role = element.getAttribute('role') || this.getImplicitRole(element);
          const label = this.getLandmarkLabel(element);
          const children = Array.from(element.children);

          landmarks.push({
            role,
            ...(label && { label }),
            element: this.createElementInfo(element),
            children
          });
        }
      }

      console.log(`[DOMAnalyzer] Found ${landmarks.length} landmarks`);
      return landmarks;

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to analyze landmarks:', error);
      return [];
    }
  }

  private async analyzeFocusableElements(document: Document): Promise<FocusableElementInfo[]> {
    try {
      const focusableSelectors = [
        'a[href]',
        'button',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ];

      const focusableElements: FocusableElementInfo[] = [];
      const selector = focusableSelectors.join(', ');
      const elements = Array.from(document.querySelectorAll(selector));

      for (const element of elements) {
        const tabIndex = this.getTabIndex(element);
        const isVisible = this.isElementVisible(element);
        const hasKeyboardHandler = this.hasKeyboardEventHandlers(element);

        focusableElements.push({
          element: this.createElementInfo(element),
          tabIndex,
          isVisible,
          hasKeyboardHandler
        });
      }

      // Sort by tab index for logical tab order
      focusableElements.sort((a, b) => {
        if (a.tabIndex === 0 && b.tabIndex === 0) return 0;
        if (a.tabIndex === 0) return 1;
        if (b.tabIndex === 0) return -1;
        return a.tabIndex - b.tabIndex;
      });

      console.log(`[DOMAnalyzer] Found ${focusableElements.length} focusable elements`);
      return focusableElements;

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to analyze focusable elements:', error);
      return [];
    }
  }

  private async analyzeSemanticStructure(document: Document): Promise<SemanticStructure> {
    try {
      const hasMain = document.querySelector('main, [role="main"]') !== null;
      const hasNavigation = document.querySelector('nav, [role="navigation"]') !== null;
      const hasHeader = document.querySelector('header, [role="banner"]') !== null;
      const hasFooter = document.querySelector('footer, [role="contentinfo"]') !== null;
      const hasAside = document.querySelector('aside, [role="complementary"]') !== null;

      // Find skip links
      const skipLinks: ElementInfo[] = [];
      const skipLinkSelectors = [
        'a[href^="#"]:first-child',
        '.skip-link',
        '.skip-to-content',
        '[class*="skip"]'
      ];

      for (const selector of skipLinkSelectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        for (const element of elements) {
          const text = element.textContent?.toLowerCase() || '';
          if (text.includes('skip') || text.includes('jump')) {
            skipLinks.push(this.createElementInfo(element));
          }
        }
      }

      const semanticStructure: SemanticStructure = {
        hasMain,
        hasNavigation,
        hasHeader,
        hasFooter,
        hasAside,
        skipLinks
      };

      console.log('[DOMAnalyzer] Analyzed semantic structure');
      return semanticStructure;

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to analyze semantic structure:', error);
      return {
        hasMain: false,
        hasNavigation: false,
        hasHeader: false,
        hasFooter: false,
        hasAside: false,
        skipLinks: []
      };
    }
  }

  // ============================================================================
  // ARIA ATTRIBUTE VALIDATION
  // ============================================================================

  async validateARIAAttributes(document: Document): Promise<{ valid: ElementInfo[]; invalid: ElementInfo[] }> {
    try {
      const elementsWithARIA = Array.from(document.querySelectorAll('[aria-*], [role]'));
      const valid: ElementInfo[] = [];
      const invalid: ElementInfo[] = [];

      for (const element of elementsWithARIA) {
        const isValid = this.validateElementARIA(element);
        const elementInfo = this.createElementInfo(element);

        if (isValid) {
          valid.push(elementInfo);
        } else {
          invalid.push(elementInfo);
        }
      }

      console.log(`[DOMAnalyzer] ARIA validation: ${valid.length} valid, ${invalid.length} invalid`);
      return { valid, invalid };

    } catch (error) {
      console.error('[DOMAnalyzer] Failed to validate ARIA attributes:', error);
      return { valid: [], invalid: [] };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private createElementInfo(element: Element): ElementInfo {
    const rect = element.getBoundingClientRect();
    const attributes: Record<string, string> = {};

    // Collect all attributes
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

  private getXPath(element: Element): string {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parts: string[] = [];
    let current: Element | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = current.previousElementSibling;

      while (sibling) {
        if (sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }

      const tagName = current.tagName.toLowerCase();
      parts.unshift(`${tagName}[${index}]`);
      current = current.parentElement;
    }

    return '/' + parts.join('/');
  }

  private getViewportInfo(): ViewportInfo {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth || 24,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };
  }

  private getInteractiveElements(document: Document): Element[] {
    const interactiveSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[onclick]',
      '[onkeydown]',
      '[onkeyup]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]'
    ];

    return Array.from(document.querySelectorAll(interactiveSelectors.join(', ')));
  }

  private getImplicitRole(element: Element): string {
    const tagName = element.tagName.toLowerCase();
    const roleMap: Record<string, string> = {
      'main': 'main',
      'nav': 'navigation',
      'header': 'banner',
      'footer': 'contentinfo',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'button': 'button',
      'a': 'link'
    };

    return roleMap[tagName] || '';
  }

  private getLandmarkLabel(element: Element): string | undefined {
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') ||
           element.getAttribute('title') ||
           undefined;
  }

  private getTabIndex(element: Element): number {
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex === null) {
      // Elements that are naturally focusable
      const naturallyFocusable = ['a', 'button', 'input', 'select', 'textarea'];
      return naturallyFocusable.includes(element.tagName.toLowerCase()) ? 0 : -1;
    }
    return parseInt(tabIndex, 10) || 0;
  }

  private isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           rect.width > 0 &&
           rect.height > 0;
  }

  private hasKeyboardEventHandlers(element: Element): boolean {
    const events = ['onkeydown', 'onkeyup', 'onkeypress'];
    return events.some(event => element.hasAttribute(event)) ||
           element.getAttribute('role') === 'button' ||
           element.tagName.toLowerCase() === 'button';
  }

  private validateElementARIA(element: Element): boolean {
    // Basic ARIA validation - can be extended
    const role = element.getAttribute('role');
    
    // Check for valid roles
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

    if (role && !validRoles.includes(role)) {
      return false;
    }

    // Additional ARIA validation can be added here
    return true;
  }

  // ============================================================================
  // PERFORMANCE AND ACCESSIBILITY ANALYSIS
  // ============================================================================

  private async analyzeAccessibility(_document: Document): Promise<AccessibilityAnalysis> {
    // This is a placeholder - will be implemented in AccessibilityScanner
    return this.getEmptyAccessibilityAnalysis();
  }

  private async measureAnalysisPerformance(): Promise<AnalysisPerformance> {
    const totalTime = performance.now() - this.analysisStartTime;
    
    return {
      totalTime,
      domTraversalTime: totalTime * 0.6, // Estimated 60% for DOM traversal
      accessibilityCheckTime: totalTime * 0.4, // Estimated 40% for accessibility checks
      elementsProcessed: this.currentDocument?.querySelectorAll('*').length || 0,
      issuesFound: 0 // Will be populated by AccessibilityScanner
    };
  }

  // ============================================================================
  // EMPTY RESULT HELPERS
  // ============================================================================

  private getEmptyPageStructure(): PageStructure {
    return {
      headingHierarchy: [],
      landmarks: [],
      focusableElements: [],
      semanticStructure: {
        hasMain: false,
        hasNavigation: false,
        hasHeader: false,
        hasFooter: false,
        hasAside: false,
        skipLinks: []
      }
    };
  }

  private getEmptyAccessibilityAnalysis(): AccessibilityAnalysis {
    return {
      pageUrl: '',
      analyzedAt: Date.now(),
      issues: [],
      complianceScore: 0,
      totalElements: 0,
      processedElements: 0,
      analysisTime: 0
    };
  }

  private getEmptyPerformanceMetrics(): AnalysisPerformance {
    return {
      totalTime: 0,
      domTraversalTime: 0,
      accessibilityCheckTime: 0,
      elementsProcessed: 0,
      issuesFound: 0
    };
  }

  // ============================================================================
  // CONFIGURATION AND LIFECYCLE
  // ============================================================================

  async updateConfig(newConfig: Partial<DOMAnalyzerConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    console.log('[DOMAnalyzer] Configuration updated');
  }

  getConfig(): DOMAnalyzerConfig {
    return { ...this.config };
  }

  isCurrentlyAnalyzing(): boolean {
    return this.isAnalyzing;
  }

  // ============================================================================
  // CLEANUP AND SHUTDOWN
  // ============================================================================

  async shutdown(): Promise<void> {
    try {
      console.log('[DOMAnalyzer] Shutting down DOM analyzer...');

      // Wait for current analysis to complete
      while (this.isAnalyzing) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      this.currentDocument = null;

      console.log('[DOMAnalyzer] DOM analyzer shutdown complete');

    } catch (error) {
      console.error('[DOMAnalyzer] Error during DOM analyzer shutdown:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const domAnalyzer = DOMAnalyzer.getInstance();
export default domAnalyzer;