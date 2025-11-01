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
import { VisualAnalysisResult } from '../types/index';
/**
 * VisualAnalysisSystem - Singleton class for visual content accessibility analysis
 *
 * Provides comprehensive analysis of visual elements including images, media,
 * and layout structure to identify accessibility barriers and suggest improvements.
 */
export declare class VisualAnalysisSystem {
    private static instance;
    private isAnalyzing;
    private analysisStartTime;
    private readonly ANALYSIS_TIME_TARGET;
    private readonly MAX_CONCURRENT_ANALYSIS;
    private analysisCount;
    private totalAnalysisTime;
    /**
     * Get singleton instance of VisualAnalysisSystem
     */
    static getInstance(): VisualAnalysisSystem;
    /**
     * Private constructor for singleton pattern
     */
    private constructor();
    /**
     * Analyze visual content accessibility in the document
     *
     * @param document - Document to analyze
     * @returns Promise<VisualAnalysisResult> - Comprehensive visual analysis results
     */
    analyzeVisualContent(document: Document): Promise<VisualAnalysisResult>;
    /**
     * Analyze images for accessibility compliance
     *
     * @param document - Document containing images
     * @returns Promise<ImageAnalysisResult> - Image analysis results
     */
    private analyzeImages;
    /**
     * Analyze individual image for accessibility
     *
     * @param image - HTMLImageElement to analyze
     * @returns Promise with image info and issues
     */
    private analyzeImage;
    /**
     * Analyze media elements (video, audio) for accessibility
     *
     * @param document - Document containing media elements
     * @returns Promise<MediaAnalysisResult> - Media analysis results
     */
    private analyzeMediaElements;
    /**
     * Analyze individual media element for accessibility
     *
     * @param media - HTMLMediaElement to analyze
     * @returns Media info and issues
     */
    private analyzeMediaElement;
    /**
     * Analyze layout structure for accessibility
     *
     * @param document - Document to analyze
     * @returns Promise with layout analysis results
     */
    private analyzeLayoutStructure;
    /**
     * Check if image is decorative based on context
     *
     * @param image - HTMLImageElement to check
     * @returns boolean - True if image appears decorative
     */
    private isImageDecorative;
    /**
     * Check if alt text is redundant or non-descriptive
     *
     * @param altText - Alt text to check
     * @returns boolean - True if alt text appears redundant
     */
    private isAltTextRedundant;
    /**
     * Check if table is used for layout rather than data
     *
     * @param table - HTMLTableElement to check
     * @returns boolean - True if table appears to be for layout
     */
    private isLayoutTable;
    /**
     * Check color contrast for text element
     *
     * @param element - Element to check
     * @returns Promise<AccessibilityIssue | null> - Contrast issue if found
     */
    private checkColorContrast;
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
    private createVisualIssue;
    /**
     * Create element information object
     *
     * @param element - Element to create info for
     * @returns ElementInfo
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
     * Get relevant attributes for element
     *
     * @param element - Element to get attributes for
     * @returns Record<string, string> - Relevant attributes
     */
    private getRelevantAttributes;
    /**
     * Get suggested fix for issue type
     *
     * @param type - Issue type
     * @returns string - Suggested fix
     */
    private getSuggestedFix;
    /**
     * Calculate overall accessibility score
     *
     * @param issues - All accessibility issues found
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
     * @returns VisualAnalysisResult - Empty result
     */
    private createEmptyResult;
}
//# sourceMappingURL=VisualAnalysisSystem.d.ts.map