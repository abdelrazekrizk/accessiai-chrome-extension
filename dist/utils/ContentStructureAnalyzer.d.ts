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
import { ContentAnalysisResult } from '../types/index';
/**
 * ContentStructureAnalyzer - Singleton class for content structure accessibility analysis
 *
 * Provides comprehensive analysis of content structure including heading hierarchy,
 * landmarks, and form accessibility to identify barriers and suggest improvements.
 */
export declare class ContentStructureAnalyzer {
    private static instance;
    private isAnalyzing;
    private analysisStartTime;
    private readonly ANALYSIS_TIME_TARGET;
    private analysisCount;
    private totalAnalysisTime;
    /**
     * Get singleton instance of ContentStructureAnalyzer
     */
    static getInstance(): ContentStructureAnalyzer;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
     * Analyze content structure accessibility in the document
     *
     * @param document - Document to analyze
     * @returns Promise<ContentAnalysisResult> - Comprehensive content structure analysis results
     */
    analyzeContentStructure(document: Document): Promise<ContentAnalysisResult>;
    /**
     * Validate heading hierarchy for accessibility compliance
     *
     * @param document - Document containing headings
     * @returns Promise<AccessibilityIssue[]> - Heading hierarchy issues
     */
    private validateHeadingHierarchy;
    /**
     * Validate landmarks for accessibility compliance
     *
     * @param document - Document containing landmarks
     * @returns Promise<AccessibilityIssue[]> - Landmark validation issues
     */
    private validateLandmarks;
    /**
     * Validate form accessibility compliance
     *
     * @param document - Document containing forms
     * @returns Promise<AccessibilityIssue[]> - Form accessibility issues
     */
    private validateFormAccessibility;
    /**
     * Create content structure accessibility issue
     *
     * @param issueData - Issue data
     * @returns Promise<AccessibilityIssue> - Created accessibility issue
     */
    private createIssue;
    /**
     * Create element information object
     *
     * @param element - Element to create info for
     * @returns ElementInfo - Element information
     */
    private createElementInfo;
    /**
     * Get XPath for element
     *
     * @param element - Element to get XPath for
     * @returns string - XPath
     */
    private getXPath;
    /**
     * Get WCAG criteria for issue type
     *
     * @param issueType - Issue type
     * @returns string[] - WCAG criteria
     */
    private getWCAGCriteria;
    /**
     * Calculate overall accessibility score
     *
     * @param totalIssues - Total number of issues found
     * @param document - Document analyzed
     * @returns number - Score from 0-100
     */
    private calculateOverallScore;
    /**
     * Record analysis performance metrics
     *
     * @param analysisTime - Time taken for analysis
     */
    private recordAnalysisMetrics;
    /**
     * Create empty result for error cases
     *
     * @returns ContentAnalysisResult - Empty result
     */
    private createEmptyResult;
    /**
     * Shutdown the analyzer
     */
    shutdown(): Promise<void>;
}
export declare const contentStructureAnalyzer: ContentStructureAnalyzer;
export default contentStructureAnalyzer;
//# sourceMappingURL=ContentStructureAnalyzer.d.ts.map