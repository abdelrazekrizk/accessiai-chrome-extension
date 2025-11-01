/**
 * VisualAnalysisSystem.ts
 * 
 * Visual Content Analysis System for AccessiAI Chrome Extension
 * Implements comprehensive visual accessibility analysis including:
 * - Image accessibility validation with alt text analysis
 * - Media element accessibility checking (video, audio)
 * - Visual layout analysis for screen reader optimization
 * 
 * Performance Target: <150ms analysis time
 * Accuracy Target: 90% for image analysis
 * 
 * @version 2.0.0
 * @author AccessiAI Team
 */

import { 
  AccessibilityIssue, 
  VisualAnalysisResult, 
  ImageAccessibilityInfo,
  MediaAccessibilityInfo,
  ElementInfo,
  AccessibilityIssueType,
  IssueSeverity
} from '../types/index';

/**
 * VisualAnalysisSystem - Singleton class for visual content accessibility analysis
 * 
 * Provides comprehensive analysis of visual elements including images, media,
 * and layout structure to identify accessibility barriers and suggest improvements.
 */
export class VisualAnalysisSystem {
  private static instance: VisualAnalysisSystem;
  
  // Core Properties
  private isAnalyzing: boolean = false;
  private analysisStartTime: number = 0;
  
  // Performance Targets
  private readonly ANALYSIS_TIME_TARGET = 150; // milliseconds
  private readonly MAX_CONCURRENT_ANALYSIS = 10; // concurrent image analysis
  
  // Analysis Counters
  private analysisCount: number = 0;
  private totalAnalysisTime: number = 0;
  
  /**
   * Get singleton instance of VisualAnalysisSystem
   */
  static getInstance(): VisualAnalysisSystem {
    if (!VisualAnalysisSystem.instance) {
      VisualAnalysisSystem.instance = new VisualAnalysisSystem();
    }
    return VisualAnalysisSystem.instance;
  }
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    console.log('[VisualAnalysisSystem] Initializing Visual Analysis System...');
  }
  
  /**
   * Analyze visual content accessibility in the document
   * 
   * @param document - Document to analyze
   * @returns Promise<VisualAnalysisResult> - Comprehensive visual analysis results
   */
  async analyzeVisualContent(document: Document): Promise<VisualAnalysisResult> {
    if (this.isAnalyzing) {
      console.warn('[VisualAnalysisSystem] Analysis already in progress, skipping...');
      return this.createEmptyResult();
    }
    
    this.isAnalyzing = true;
    this.analysisStartTime = performance.now();
    
    try {
      console.log('[VisualAnalysisSystem] Starting comprehensive visual analysis...');
      
      // Parallel analysis of different visual components
      const [imageAnalysis, mediaAnalysis, layoutAnalysis] = await Promise.all([
        this.analyzeImages(document),
        this.analyzeMediaElements(document),
        this.analyzeLayoutStructure(document)
      ]);
      
      // Combine all issues
      const allIssues: AccessibilityIssue[] = [
        ...imageAnalysis.issues,
        ...mediaAnalysis.issues,
        ...layoutAnalysis.issues
      ];
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(allIssues, document);
      
      const analysisTime = performance.now() - this.analysisStartTime;
      this.recordAnalysisMetrics(analysisTime);
      
      const result: VisualAnalysisResult = {
        overallScore,
        analysisTime,
        imageAnalysis,
        mediaAnalysis,
        layoutAnalysis,
        totalIssues: allIssues.length,
        criticalIssues: allIssues.filter(issue => issue.severity === 'critical').length,
        warningIssues: allIssues.filter(issue => issue.severity === 'high').length,
        infoIssues: allIssues.filter(issue => issue.severity === 'low').length,
        timestamp: new Date().toISOString()
      };
      
      console.log(`[VisualAnalysisSystem] Analysis completed in ${analysisTime.toFixed(2)}ms`);
      console.log(`[VisualAnalysisSystem] Found ${allIssues.length} visual accessibility issues`);
      
      return result;
      
    } catch (error) {
      console.error('[VisualAnalysisSystem] Analysis failed:', error);
      throw error;
    } finally {
      this.isAnalyzing = false;
    }
  }
  
  /**
   * Analyze images for accessibility compliance
   * 
   * @param document - Document containing images
   * @returns Promise<ImageAnalysisResult> - Image analysis results
   */
  private async analyzeImages(document: Document): Promise<{ issues: AccessibilityIssue[], imageInfos: ImageAccessibilityInfo[] }> {
    try {
      console.log('[VisualAnalysisSystem] Analyzing image accessibility...');
      
      const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
      const imageInfos: ImageAccessibilityInfo[] = [];
      const issues: AccessibilityIssue[] = [];
      
      // Process images in batches to avoid overwhelming the system
      const batchSize = this.MAX_CONCURRENT_ANALYSIS;
      for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(img => this.analyzeImage(img))
        );
        
        batchResults.forEach(result => {
          imageInfos.push(result.info);
          issues.push(...result.issues);
        });
      }
      
      console.log(`[VisualAnalysisSystem] Analyzed ${images.length} images, found ${issues.length} issues`);
      
      return { issues, imageInfos };
      
    } catch (error) {
      console.error('[VisualAnalysisSystem] Image analysis failed:', error);
      return { issues: [], imageInfos: [] };
    }
  }
  
  /**
   * Analyze individual image for accessibility
   * 
   * @param image - HTMLImageElement to analyze
   * @returns Promise with image info and issues
   */
  private async analyzeImage(image: HTMLImageElement): Promise<{ info: ImageAccessibilityInfo, issues: AccessibilityIssue[] }> {
    const issues: AccessibilityIssue[] = [];
    
    // Get image properties
    const src = image.src || '';
    const alt = image.alt || '';
    const title = image.title || '';
    const ariaLabel = image.getAttribute('aria-label') || '';
    const ariaLabelledBy = image.getAttribute('aria-labelledby') || '';
    const role = image.getAttribute('role') || '';
    
    // Check for missing alt text
    if (!alt && !ariaLabel && !ariaLabelledBy && role !== 'presentation' && role !== 'none') {
      issues.push(this.createVisualIssue(
        'missing-alt-text',
        image,
        'Image is missing alternative text. Add descriptive alt text for screen readers.',
        'critical',
        ['1.1.1']
      ));
    }
    
    // Check for empty alt text on informative images
    if (alt === '' && !ariaLabel && !ariaLabelledBy && role !== 'presentation' && role !== 'none') {
      // Check if image appears to be decorative based on context
      const isDecorative = this.isImageDecorative(image);
      if (!isDecorative) {
        issues.push(this.createVisualIssue(
          'missing-alt-text',
          image,
          'Image appears informative but has empty alt text. Provide descriptive alternative text.',
          'high',
          ['1.1.1']
        ));
      }
    }
    
    // Check for redundant alt text
    if (alt && this.isAltTextRedundant(alt)) {
      issues.push(this.createVisualIssue(
        'missing-alt-text',
        image,
        'Alt text appears redundant or non-descriptive. Provide meaningful description.',
        'medium',
        ['1.1.1']
      ));
    }
    
    // Check for alt text length
    if (alt && alt.length > 125) {
      issues.push(this.createVisualIssue(
        'missing-alt-text',
        image,
        'Alt text is very long. Consider using shorter description or longdesc attribute.',
        'low',
        ['1.1.1']
      ));
    }
    
    const imageInfo: ImageAccessibilityInfo = {
      src,
      alt,
      title,
      ariaLabel,
      ariaLabelledBy,
      role,
      isDecorative: role === 'presentation' || role === 'none',
      hasAccessibleName: !!(alt || ariaLabel || ariaLabelledBy),
      elementInfo: this.createElementInfo(image)
    };
    
    return { info: imageInfo, issues };
  }
  
  /**
   * Analyze media elements (video, audio) for accessibility
   * 
   * @param document - Document containing media elements
   * @returns Promise<MediaAnalysisResult> - Media analysis results
   */
  private async analyzeMediaElements(document: Document): Promise<{ issues: AccessibilityIssue[], mediaInfos: MediaAccessibilityInfo[] }> {
    try {
      console.log('[VisualAnalysisSystem] Analyzing media accessibility...');
      
      const mediaElements = Array.from(document.querySelectorAll('video, audio')) as HTMLMediaElement[];
      const mediaInfos: MediaAccessibilityInfo[] = [];
      const issues: AccessibilityIssue[] = [];
      
      for (const media of mediaElements) {
        const result = this.analyzeMediaElement(media);
        mediaInfos.push(result.info);
        issues.push(...result.issues);
      }
      
      console.log(`[VisualAnalysisSystem] Analyzed ${mediaElements.length} media elements, found ${issues.length} issues`);
      
      return { issues, mediaInfos };
      
    } catch (error) {
      console.error('[VisualAnalysisSystem] Media analysis failed:', error);
      return { issues: [], mediaInfos: [] };
    }
  }
  
  /**
   * Analyze individual media element for accessibility
   * 
   * @param media - HTMLMediaElement to analyze
   * @returns Media info and issues
   */
  private analyzeMediaElement(media: HTMLMediaElement): { info: MediaAccessibilityInfo, issues: AccessibilityIssue[] } {
    const issues: AccessibilityIssue[] = [];
    const isVideo = media.tagName.toLowerCase() === 'video';
    
    // Check for captions/subtitles
    const tracks = Array.from(media.querySelectorAll('track'));
    const hasCaptions = tracks.some(track => 
      track.kind === 'captions' || track.kind === 'subtitles'
    );
    
    if (!hasCaptions) {
      issues.push(this.createVisualIssue(
        'missing-labels',
        media,
        isVideo 
          ? 'Video is missing captions or subtitles. Provide captions for accessibility.'
          : 'Audio content should have a transcript available.',
        'critical',
        ['1.2.2', '1.2.3']
      ));
    }
    
    // Check for audio descriptions (video only)
    if (isVideo) {
      const hasAudioDescription = tracks.some(track => track.kind === 'descriptions');
      if (!hasAudioDescription) {
        issues.push(this.createVisualIssue(
          'missing-labels',
          media,
          'Video may need audio descriptions for visual content. Consider adding audio descriptions.',
          'medium',
          ['1.2.5']
        ));
      }
    }
    
    // Check for autoplay
    if (media.autoplay) {
      issues.push(this.createVisualIssue(
        'focus-management',
        media,
        'Media autoplays which can be disorienting. Consider removing autoplay or providing controls.',
        'medium',
        ['1.4.2']
      ));
    }
    
    // Check for controls
    if (!media.controls && !media.muted) {
      issues.push(this.createVisualIssue(
        'keyboard-inaccessible',
        media,
        'Media lacks user controls. Provide controls for user to pause, stop, or adjust volume.',
        'medium',
        ['1.4.2']
      ));
    }
    
    const mediaInfo: MediaAccessibilityInfo = {
      type: isVideo ? 'video' : 'audio',
      src: media.src || '',
      hasCaptions,
      hasAudioDescription: isVideo ? tracks.some(track => track.kind === 'descriptions') : false,
      hasControls: media.controls,
      autoplay: media.autoplay,
      muted: media.muted,
      tracks: tracks.map(track => ({
        kind: track.kind,
        src: track.src,
        label: track.label,
        srclang: track.srclang
      })),
      elementInfo: this.createElementInfo(media)
    };
    
    return { info: mediaInfo, issues };
  }
  
  /**
   * Analyze layout structure for accessibility
   * 
   * @param document - Document to analyze
   * @returns Promise with layout analysis results
   */
  private async analyzeLayoutStructure(document: Document): Promise<{ issues: AccessibilityIssue[] }> {
    try {
      console.log('[VisualAnalysisSystem] Analyzing layout accessibility...');
      
      const issues: AccessibilityIssue[] = [];
      
      // Check for layout tables used for positioning
      const tables = Array.from(document.querySelectorAll('table'));
      for (const table of tables) {
        if (this.isLayoutTable(table)) {
          issues.push(this.createVisualIssue(
            'semantic-markup',
            table,
            'Table appears to be used for layout. Use CSS for layout instead of tables.',
            'medium',
            ['1.3.1']
          ));
        }
      }
      
      // Check for elements with insufficient color contrast
      const textElements = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label'));
      for (const element of textElements.slice(0, 50)) { // Limit to first 50 for performance
        const contrastIssue = await this.checkColorContrast(element);
        if (contrastIssue) {
          issues.push(contrastIssue);
        }
      }
      
      console.log(`[VisualAnalysisSystem] Layout analysis found ${issues.length} issues`);
      
      return { issues };
      
    } catch (error) {
      console.error('[VisualAnalysisSystem] Layout analysis failed:', error);
      return { issues: [] };
    }
  }
  
  /**
   * Check if image is decorative based on context
   * 
   * @param image - HTMLImageElement to check
   * @returns boolean - True if image appears decorative
   */
  private isImageDecorative(image: HTMLImageElement): boolean {
    // Check parent elements for decorative context
    const parent = image.parentElement;
    if (parent) {
      // Images in decorative containers
      if (parent.classList.contains('decoration') || 
          parent.classList.contains('ornament') ||
          parent.classList.contains('background')) {
        return true;
      }
    }
    
    // Check image source for decorative patterns
    const src = image.src.toLowerCase();
    const decorativePatterns = ['decoration', 'ornament', 'divider', 'spacer', 'bullet'];
    
    return decorativePatterns.some(pattern => src.includes(pattern));
  }
  
  /**
   * Check if alt text is redundant or non-descriptive
   * 
   * @param altText - Alt text to check
   * @returns boolean - True if alt text appears redundant
   */
  private isAltTextRedundant(altText: string): boolean {
    const redundantPatterns = [
      /^image$/i,
      /^picture$/i,
      /^photo$/i,
      /^graphic$/i,
      /^image of$/i,
      /^picture of$/i,
      /^photo of$/i
    ];
    
    return redundantPatterns.some(pattern => pattern.test(altText.trim()));
  }
  
  /**
   * Check if table is used for layout rather than data
   * 
   * @param table - HTMLTableElement to check
   * @returns boolean - True if table appears to be for layout
   */
  private isLayoutTable(table: HTMLTableElement): boolean {
    // Tables with role="presentation" are layout tables
    if (table.getAttribute('role') === 'presentation') {
      return true;
    }
    
    // Check for table headers
    const headers = table.querySelectorAll('th');
    if (headers.length === 0) {
      return true; // Likely layout table if no headers
    }
    
    // Check for caption or summary
    const caption = table.querySelector('caption');
    const summary = table.getAttribute('summary');
    if (!caption && !summary) {
      return true; // Data tables should have caption or summary
    }
    
    return false;
  }
  
  /**
   * Check color contrast for text element
   * 
   * @param element - Element to check
   * @returns Promise<AccessibilityIssue | null> - Contrast issue if found
   */
  private async checkColorContrast(element: Element): Promise<AccessibilityIssue | null> {
    try {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Skip if no text content
      if (!element.textContent?.trim()) {
        return null;
      }
      
      // Basic contrast check (simplified)
      if (color === backgroundColor) {
        return this.createVisualIssue(
          'insufficient-contrast',
          element,
          'Text and background colors are identical, making text invisible.',
          'critical',
          ['1.4.3']
        );
      }
      
      // Additional contrast ratio calculation would go here
      // For now, we'll skip complex color contrast calculations
      
      return null;
      
    } catch (error) {
      console.warn('[VisualAnalysisSystem] Color contrast check failed:', error);
      return null;
    }
  }
  
  /**
   * Create visual accessibility issue
   * 
   * @param type - Issue type
   * @param element - Element with issue
   * @param description - Issue description
   * @param severity - Issue severity
   * @param wcagCriteria - WCAG criteria
   * @returns AccessibilityIssue
   */
  private createVisualIssue(
    type: AccessibilityIssueType, 
    element: Element, 
    description: string,
    severity: IssueSeverity = 'medium',
    wcagCriteria: string[] = []
  ): AccessibilityIssue {
    return {
      id: `visual-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      description,
      element: this.createElementInfo(element),
      wcagCriteria,
      suggestedFix: this.getSuggestedFix(type),
      detectedAt: Date.now(),
      confidence: 0.9 // High confidence for visual analysis
    };
  }
  
  /**
   * Create element information object
   * 
   * @param element - Element to create info for
   * @returns ElementInfo
   */
  private createElementInfo(element: Element): ElementInfo {
    const rect = element.getBoundingClientRect();
    const elementInfo: ElementInfo = {
      tagName: element.tagName.toLowerCase(),
      xpath: this.getXPath(element),
      attributes: this.getRelevantAttributes(element),
      boundingRect: rect
    };
    
    // Add optional properties only if they have values
    if (element.id) {
      (elementInfo as any).id = element.id;
    }
    if (element.className) {
      (elementInfo as any).className = element.className;
    }
    if (element.textContent) {
      (elementInfo as any).textContent = element.textContent.substring(0, 100);
    }
    
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
  
  /**
   * Get relevant attributes for element
   * 
   * @param element - Element to get attributes for
   * @returns Record<string, string> - Relevant attributes
   */
  private getRelevantAttributes(element: Element): Record<string, string> {
    const relevantAttrs = ['alt', 'title', 'aria-label', 'aria-labelledby', 'role', 'src', 'href'];
    const attributes: Record<string, string> = {};
    
    relevantAttrs.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        attributes[attr] = value;
      }
    });
    
    return attributes;
  }
  
  /**
   * Get suggested fix for issue type
   * 
   * @param type - Issue type
   * @returns string - Suggested fix
   */
  private getSuggestedFix(type: AccessibilityIssueType): string {
    const fixes: Partial<Record<AccessibilityIssueType, string>> = {
      'missing-alt-text': 'Add descriptive alt attribute to the image element',
      'insufficient-contrast': 'Increase color contrast between text and background',
      'missing-labels': 'Add proper labels to form controls',
      'semantic-markup': 'Use semantic HTML elements for better structure'
    };
    
    return fixes[type] || 'Review element for accessibility compliance';
  }
  
  /**
   * Calculate overall accessibility score
   * 
   * @param issues - All accessibility issues found
   * @param document - Document analyzed
   * @returns number - Score from 0-100
   */
  private calculateOverallScore(issues: AccessibilityIssue[], document: Document): number {
    const totalElements = document.querySelectorAll('img, video, audio, table').length;
    if (totalElements === 0) return 100;
    
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const warningIssues = issues.filter(issue => issue.severity === 'high').length;
    const infoIssues = issues.filter(issue => issue.severity === 'low').length;
    
    // Weight different severity levels
    const weightedIssues = (criticalIssues * 3) + (warningIssues * 2) + (infoIssues * 1);
    const maxPossibleIssues = totalElements * 3; // Assume max 3 critical issues per element
    
    const score = Math.max(0, 100 - (weightedIssues / maxPossibleIssues * 100));
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
      console.warn(`[VisualAnalysisSystem] Analysis time ${analysisTime.toFixed(2)}ms exceeded target ${this.ANALYSIS_TIME_TARGET}ms`);
    }
    
    console.log(`[VisualAnalysisSystem] Average analysis time: ${averageTime.toFixed(2)}ms`);
  }
  
  /**
   * Create empty result for error cases
   * 
   * @returns VisualAnalysisResult - Empty result
   */
  private createEmptyResult(): VisualAnalysisResult {
    return {
      overallScore: 0,
      analysisTime: 0,
      imageAnalysis: { issues: [], imageInfos: [] },
      mediaAnalysis: { issues: [], mediaInfos: [] },
      layoutAnalysis: { issues: [] },
      totalIssues: 0,
      criticalIssues: 0,
      warningIssues: 0,
      infoIssues: 0,
      timestamp: new Date().toISOString()
    };
  }
}