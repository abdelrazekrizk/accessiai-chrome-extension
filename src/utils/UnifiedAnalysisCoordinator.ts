/**
 * UnifiedAnalysisCoordinator.ts
 * 
 * Unified Analysis Coordination System for AccessiAI Chrome Extension
 * Integrates and coordinates multiple analysis systems including:
 * - ContentStructureAnalyzer for heading hierarchy and form validation
 * - VisualAnalysisSystem for image and media analysis
 * - Unified result aggregation and issue management
 * 
 * Performance Target: <200ms end-to-end analysis pipeline
 * Integration: Seamless coordination between analysis systems
 * 
 * @version 2.0.0
 * @author AccessiAI Team
 */

import { 
  AccessibilityIssue,
  ContentAnalysisResult,
  VisualAnalysisResult,
  AccessibilityAnalysis,
  IssueSeverity
} from '../types/index';

import { ContentStructureAnalyzer } from './ContentStructureAnalyzer';
import { VisualAnalysisSystem } from './VisualAnalysisSystem';
import { IndexedDBManager } from './IndexedDBManager';

/**
 * Unified analysis result combining all analysis types
 */
export interface UnifiedAnalysisResult {
  readonly overallScore: number;
  readonly analysisTime: number;
  readonly contentAnalysis: ContentAnalysisResult;
  readonly visualAnalysis: VisualAnalysisResult;
  readonly aggregatedIssues: AccessibilityIssue[];
  readonly issuesByCategory: Record<string, AccessibilityIssue[]>;
  readonly issuesBySeverity: Record<IssueSeverity, AccessibilityIssue[]>;
  readonly totalIssues: number;
  readonly criticalIssues: number;
  readonly highPriorityIssues: number;
  readonly mediumPriorityIssues: number;
  readonly lowPriorityIssues: number;
  readonly pageUrl: string;
  readonly timestamp: string;
}

/**
 * Analysis configuration options
 */
export interface AnalysisConfig {
  readonly enableContentAnalysis: boolean;
  readonly enableVisualAnalysis: boolean;
  readonly enableParallelExecution: boolean;
  readonly storeResults: boolean;
  readonly includeResolvedIssues: boolean;
  readonly maxIssuesPerCategory: number;
}

/**
 * Analysis progress callback
 */
export type AnalysisProgressCallback = (progress: {
  stage: string;
  percentage: number;
  currentTask: string;
}) => void;

/**
 * UnifiedAnalysisCoordinator - Central coordination for all analysis systems
 * 
 * Provides unified analysis coordination with parallel execution,
 * result aggregation, and seamless integration between analysis systems.
 */
export class UnifiedAnalysisCoordinator {
  private static instance: UnifiedAnalysisCoordinator;
  
  // Core Properties
  private isAnalyzing: boolean = false;
  private isInitialized: boolean = false;
  
  // Analysis Systems
  private contentAnalyzer: ContentStructureAnalyzer;
  private visualAnalyzer: VisualAnalysisSystem;
  private dbManager: IndexedDBManager;
  
  // Performance Tracking
  private readonly ANALYSIS_PIPELINE_TARGET = 200; // milliseconds
  private analysisCount: number = 0;
  private totalAnalysisTime: number = 0;
  
  // Default Configuration
  private readonly DEFAULT_CONFIG: AnalysisConfig = {
    enableContentAnalysis: true,
    enableVisualAnalysis: true,
    enableParallelExecution: true,
    storeResults: true,
    includeResolvedIssues: false,
    maxIssuesPerCategory: 50
  };

  /**
   * Get singleton instance of UnifiedAnalysisCoordinator
   */
  static getInstance(): UnifiedAnalysisCoordinator {
    if (!UnifiedAnalysisCoordinator.instance) {
      UnifiedAnalysisCoordinator.instance = new UnifiedAnalysisCoordinator();
    }
    return UnifiedAnalysisCoordinator.instance;
  }

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    console.log('[UnifiedAnalysisCoordinator] Initializing Unified Analysis Coordination System...');
    
    // Initialize analysis systems
    this.contentAnalyzer = ContentStructureAnalyzer.getInstance();
    this.visualAnalyzer = VisualAnalysisSystem.getInstance();
    this.dbManager = IndexedDBManager.getInstance();
  }

  /**
   * Initialize the unified analysis coordinator
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[UnifiedAnalysisCoordinator] Already initialized, skipping...');
      return;
    }

    const startTime = performance.now();
    
    try {
      console.log('[UnifiedAnalysisCoordinator] Starting coordinator initialization...');
      
      // Initialize database manager
      await this.dbManager.initialize();
      
      this.isInitialized = true;
      const initTime = performance.now() - startTime;
      
      console.log(`[UnifiedAnalysisCoordinator] Initialization completed in ${initTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[UnifiedAnalysisCoordinator] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Perform unified accessibility analysis
   */
  async analyzeAccessibility(
    document: Document = window.document,
    config: Partial<AnalysisConfig> = {},
    progressCallback?: AnalysisProgressCallback
  ): Promise<UnifiedAnalysisResult> {
    if (this.isAnalyzing) {
      console.warn('[UnifiedAnalysisCoordinator] Analysis already in progress, skipping...');
      throw new Error('Analysis already in progress');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    this.isAnalyzing = true;
    const analysisStartTime = performance.now();
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    try {
      console.log('[UnifiedAnalysisCoordinator] Starting unified accessibility analysis...');
      
      // Report initial progress
      progressCallback?.({
        stage: 'initialization',
        percentage: 0,
        currentTask: 'Preparing analysis systems'
      });

      let contentAnalysis: ContentAnalysisResult | null = null;
      let visualAnalysis: VisualAnalysisResult | null = null;

      if (finalConfig.enableParallelExecution && finalConfig.enableContentAnalysis && finalConfig.enableVisualAnalysis) {
        // Parallel execution for better performance
        console.log('[UnifiedAnalysisCoordinator] Executing parallel analysis...');
        
        progressCallback?.({
          stage: 'analysis',
          percentage: 10,
          currentTask: 'Running parallel content and visual analysis'
        });

        const [contentResult, visualResult] = await Promise.all([
          this.contentAnalyzer.analyzeContentStructure(document),
          this.visualAnalyzer.analyzeVisualContent(document)
        ]);

        contentAnalysis = contentResult;
        visualAnalysis = visualResult;

        progressCallback?.({
          stage: 'analysis',
          percentage: 70,
          currentTask: 'Parallel analysis completed'
        });

      } else {
        // Sequential execution
        console.log('[UnifiedAnalysisCoordinator] Executing sequential analysis...');
        
        if (finalConfig.enableContentAnalysis) {
          progressCallback?.({
            stage: 'content-analysis',
            percentage: 20,
            currentTask: 'Analyzing content structure'
          });
          
          contentAnalysis = await this.contentAnalyzer.analyzeContentStructure(document);
          
          progressCallback?.({
            stage: 'content-analysis',
            percentage: 50,
            currentTask: 'Content analysis completed'
          });
        }

        if (finalConfig.enableVisualAnalysis) {
          progressCallback?.({
            stage: 'visual-analysis',
            percentage: 60,
            currentTask: 'Analyzing visual content'
          });
          
          visualAnalysis = await this.visualAnalyzer.analyzeVisualContent(document);
          
          progressCallback?.({
            stage: 'visual-analysis',
            percentage: 80,
            currentTask: 'Visual analysis completed'
          });
        }
      }

      // Aggregate results
      progressCallback?.({
        stage: 'aggregation',
        percentage: 85,
        currentTask: 'Aggregating analysis results'
      });

      const unifiedResult = await this.aggregateResults(
        contentAnalysis,
        visualAnalysis,
        document,
        finalConfig
      );

      // Store results if enabled
      if (finalConfig.storeResults) {
        progressCallback?.({
          stage: 'storage',
          percentage: 95,
          currentTask: 'Storing analysis results'
        });

        await this.storeAnalysisResults(unifiedResult);
      }

      const totalAnalysisTime = performance.now() - analysisStartTime;
      this.recordAnalysisMetrics(totalAnalysisTime);

      progressCallback?.({
        stage: 'completed',
        percentage: 100,
        currentTask: 'Analysis completed successfully'
      });

      console.log(`[UnifiedAnalysisCoordinator] Unified analysis completed in ${totalAnalysisTime.toFixed(2)}ms`);
      console.log(`[UnifiedAnalysisCoordinator] Found ${unifiedResult.totalIssues} total accessibility issues`);

      return unifiedResult;

    } catch (error) {
      console.error('[UnifiedAnalysisCoordinator] Analysis failed:', error);
      throw error;
    } finally {
      this.isAnalyzing = false;
    }
  }  /**

   * Aggregate results from multiple analysis systems
   */
  private async aggregateResults(
    contentAnalysis: ContentAnalysisResult | null,
    visualAnalysis: VisualAnalysisResult | null,
    document: Document,
    config: AnalysisConfig
  ): Promise<UnifiedAnalysisResult> {
    console.log('[UnifiedAnalysisCoordinator] Aggregating analysis results...');

    // Collect all issues
    const allIssues: AccessibilityIssue[] = [];
    
    if (contentAnalysis) {
      allIssues.push(...contentAnalysis.headingIssues);
      allIssues.push(...contentAnalysis.landmarkIssues);
      allIssues.push(...contentAnalysis.formIssues);
    }
    
    if (visualAnalysis) {
      allIssues.push(...visualAnalysis.imageAnalysis.issues);
      allIssues.push(...visualAnalysis.mediaAnalysis.issues);
      allIssues.push(...visualAnalysis.layoutAnalysis.issues);
    }

    // Filter resolved issues if needed
    const filteredIssues = config.includeResolvedIssues 
      ? allIssues 
      : allIssues.filter(issue => !('resolved' in issue) || !(issue as any).resolved);

    // Group issues by category
    const issuesByCategory = this.groupIssuesByCategory(filteredIssues);
    
    // Group issues by severity
    const issuesBySeverity = this.groupIssuesBySeverity(filteredIssues);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(contentAnalysis, visualAnalysis);

    // Calculate analysis time
    const totalAnalysisTime = (contentAnalysis?.analysisTime || 0) + (visualAnalysis?.analysisTime || 0);

    const result: UnifiedAnalysisResult = {
      overallScore,
      analysisTime: totalAnalysisTime,
      contentAnalysis: contentAnalysis || this.createEmptyContentAnalysis(),
      visualAnalysis: visualAnalysis || this.createEmptyVisualAnalysis(),
      aggregatedIssues: filteredIssues,
      issuesByCategory,
      issuesBySeverity,
      totalIssues: filteredIssues.length,
      criticalIssues: (issuesBySeverity.critical || []).length,
      highPriorityIssues: (issuesBySeverity.high || []).length,
      mediumPriorityIssues: (issuesBySeverity.medium || []).length,
      lowPriorityIssues: (issuesBySeverity.low || []).length,
      pageUrl: document.location.href,
      timestamp: new Date().toISOString()
    };

    console.log(`[UnifiedAnalysisCoordinator] Aggregated ${result.totalIssues} issues across ${Object.keys(issuesByCategory).length} categories`);

    return result;
  }

  /**
   * Group issues by category
   */
  private groupIssuesByCategory(issues: AccessibilityIssue[]): Record<string, AccessibilityIssue[]> {
    const grouped: Record<string, AccessibilityIssue[]> = {};
    
    for (const issue of issues) {
      const category = issue.category || this.getCategoryFromType(issue.type);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(issue);
    }
    
    return grouped;
  }

  /**
   * Group issues by severity
   */
  private groupIssuesBySeverity(issues: AccessibilityIssue[]): Record<IssueSeverity, AccessibilityIssue[]> {
    const grouped: Record<IssueSeverity, AccessibilityIssue[]> = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    for (const issue of issues) {
      grouped[issue.severity].push(issue);
    }
    
    return grouped;
  }

  /**
   * Get category from issue type
   */
  private getCategoryFromType(type: string): string {
    const categoryMap: Record<string, string> = {
      'missing-alt-text': 'visual',
      'insufficient-contrast': 'visual',
      'heading-structure': 'content',
      'missing-labels': 'content',
      'keyboard-inaccessible': 'interaction',
      'invalid-aria': 'structure',
      'focus-management': 'interaction'
    };
    
    return categoryMap[type] || 'general';
  }

  /**
   * Calculate overall accessibility score
   */
  private calculateOverallScore(
    contentAnalysis: ContentAnalysisResult | null,
    visualAnalysis: VisualAnalysisResult | null
  ): number {
    const scores: number[] = [];
    
    if (contentAnalysis) {
      scores.push(contentAnalysis.overallScore);
    }
    
    if (visualAnalysis) {
      scores.push(visualAnalysis.overallScore);
    }
    
    if (scores.length === 0) {
      return 0;
    }
    
    // Calculate weighted average (content analysis weighted slightly higher)
    if (scores.length === 2) {
      return Math.round((scores[0]! * 0.6) + (scores[1]! * 0.4));
    }
    
    return Math.round(scores[0] || 0);
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(result: UnifiedAnalysisResult): Promise<void> {
    try {
      console.log('[UnifiedAnalysisCoordinator] Storing analysis results...');
      
      // Create AccessibilityAnalysis object for storage
      const analysisForStorage: AccessibilityAnalysis = {
        pageUrl: result.pageUrl,
        analyzedAt: Date.now(),
        issues: result.aggregatedIssues,
        complianceScore: result.overallScore,
        totalElements: 0, // Would need to calculate from document
        processedElements: 0, // Would need to track during analysis
        analysisTime: result.analysisTime
      };
      
      // Store the analysis
      await this.dbManager.storeAccessibilityAnalysis(analysisForStorage);
      
      // Store individual issues
      for (const issue of result.aggregatedIssues) {
        await this.dbManager.storeAccessibilityIssue(issue);
      }
      
      console.log('[UnifiedAnalysisCoordinator] Analysis results stored successfully');
    } catch (error) {
      console.error('[UnifiedAnalysisCoordinator] Failed to store analysis results:', error);
      // Don't throw - storage failure shouldn't break analysis
    }
  }

  /**
   * Create empty content analysis result
   */
  private createEmptyContentAnalysis(): ContentAnalysisResult {
    return {
      overallScore: 100,
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
   * Create empty visual analysis result
   */
  private createEmptyVisualAnalysis(): VisualAnalysisResult {
    return {
      overallScore: 100,
      analysisTime: 0,
      imageAnalysis: {
        issues: [],
        imageInfos: []
      },
      mediaAnalysis: {
        issues: [],
        mediaInfos: []
      },
      layoutAnalysis: {
        issues: []
      },
      totalIssues: 0,
      criticalIssues: 0,
      warningIssues: 0,
      infoIssues: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get analysis history from database
   */
  async getAnalysisHistory(_pageUrl?: string, limit: number = 10): Promise<AccessibilityAnalysis[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // This would need to be implemented in IndexedDBManager
      // For now, return empty array
      console.log(`[UnifiedAnalysisCoordinator] Retrieving analysis history (limit: ${limit})`);
      return [];
    } catch (error) {
      console.error('[UnifiedAnalysisCoordinator] Failed to get analysis history:', error);
      return [];
    }
  }

  /**
   * Get current analysis status
   */
  getAnalysisStatus(): {
    isAnalyzing: boolean;
    isInitialized: boolean;
    analysisCount: number;
    averageAnalysisTime: number;
  } {
    return {
      isAnalyzing: this.isAnalyzing,
      isInitialized: this.isInitialized,
      analysisCount: this.analysisCount,
      averageAnalysisTime: this.analysisCount > 0 ? this.totalAnalysisTime / this.analysisCount : 0
    };
  }

  /**
   * Record analysis performance metrics
   */
  private recordAnalysisMetrics(analysisTime: number): void {
    this.analysisCount++;
    this.totalAnalysisTime += analysisTime;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    analysisCount: number;
    totalAnalysisTime: number;
    averageAnalysisTime: number;
    targetTime: number;
    performanceRatio: number;
  } {
    const averageTime = this.analysisCount > 0 ? this.totalAnalysisTime / this.analysisCount : 0;
    
    return {
      analysisCount: this.analysisCount,
      totalAnalysisTime: this.totalAnalysisTime,
      averageAnalysisTime: averageTime,
      targetTime: this.ANALYSIS_PIPELINE_TARGET,
      performanceRatio: averageTime > 0 ? this.ANALYSIS_PIPELINE_TARGET / averageTime : 1
    };
  }

  /**
   * Reset analysis metrics
   */
  resetMetrics(): void {
    this.analysisCount = 0;
    this.totalAnalysisTime = 0;
    console.log('[UnifiedAnalysisCoordinator] Performance metrics reset');
  }
}