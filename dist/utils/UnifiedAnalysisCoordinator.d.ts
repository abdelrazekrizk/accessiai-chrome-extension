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
import { AccessibilityIssue, ContentAnalysisResult, VisualAnalysisResult, AccessibilityAnalysis, IssueSeverity } from '../types/index';
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
export declare class UnifiedAnalysisCoordinator {
    private static instance;
    private isAnalyzing;
    private isInitialized;
    private contentAnalyzer;
    private visualAnalyzer;
    private dbManager;
    private readonly ANALYSIS_PIPELINE_TARGET;
    private analysisCount;
    private totalAnalysisTime;
    private readonly DEFAULT_CONFIG;
    /**
     * Get singleton instance of UnifiedAnalysisCoordinator
     */
    static getInstance(): UnifiedAnalysisCoordinator;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
     * Initialize the unified analysis coordinator
     */
    initialize(): Promise<void>;
    /**
     * Perform unified accessibility analysis
     */
    analyzeAccessibility(document?: Document, config?: Partial<AnalysisConfig>, progressCallback?: AnalysisProgressCallback): Promise<UnifiedAnalysisResult>; /**
  
     * Aggregate results from multiple analysis systems
     */
    private aggregateResults;
    /**
     * Group issues by category
     */
    private groupIssuesByCategory;
    /**
     * Group issues by severity
     */
    private groupIssuesBySeverity;
    /**
     * Get category from issue type
     */
    private getCategoryFromType;
    /**
     * Calculate overall accessibility score
     */
    private calculateOverallScore;
    /**
     * Store analysis results in database
     */
    private storeAnalysisResults;
    /**
     * Create empty content analysis result
     */
    private createEmptyContentAnalysis;
    /**
     * Create empty visual analysis result
     */
    private createEmptyVisualAnalysis;
    /**
     * Get analysis history from database
     */
    getAnalysisHistory(_pageUrl?: string, limit?: number): Promise<AccessibilityAnalysis[]>;
    /**
     * Get current analysis status
     */
    getAnalysisStatus(): {
        isAnalyzing: boolean;
        isInitialized: boolean;
        analysisCount: number;
        averageAnalysisTime: number;
    };
    /**
     * Record analysis performance metrics
     */
    private recordAnalysisMetrics;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        analysisCount: number;
        totalAnalysisTime: number;
        averageAnalysisTime: number;
        targetTime: number;
        performanceRatio: number;
    };
    /**
     * Reset analysis metrics
     */
    resetMetrics(): void;
}
//# sourceMappingURL=UnifiedAnalysisCoordinator.d.ts.map