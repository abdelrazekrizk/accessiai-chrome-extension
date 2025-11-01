/**
 * AccessiAI DOM Analyzer - DOM Analysis Engine
 * Comprehensive DOM tree analysis with accessibility focus
 * Provides real-time DOM structure analysis and accessibility validation
 */
import type { PageContext, DOMAnalysisResult, ElementInfo } from '../types/index';
export interface DOMAnalyzerConfig {
    readonly enableDeepAnalysis: boolean;
    readonly maxAnalysisTime: number;
    readonly includeHiddenElements: boolean;
    readonly enablePerformanceMetrics: boolean;
    readonly semanticAnalysisDepth: number;
}
export interface AnalysisOptions {
    readonly includeStructure: boolean;
    readonly includeAccessibility: boolean;
    readonly includePerformance: boolean;
    readonly maxDepth?: number;
    readonly targetElements?: string[];
}
export interface DOMTraversalResult {
    readonly totalElements: number;
    readonly processedElements: number;
    readonly skippedElements: number;
    readonly traversalTime: number;
    readonly errors: string[];
}
export declare class DOMAnalyzer {
    private isAnalyzing;
    private analysisStartTime;
    private currentDocument;
    private config;
    private readonly ANALYSIS_TIME_TARGET;
    private static instance;
    static getInstance(): DOMAnalyzer;
    private constructor();
    analyzePage(document: Document, options?: AnalysisOptions): Promise<DOMAnalysisResult>;
    createPageContext(document: Document): Promise<PageContext>;
    private analyzePageStructure;
    private analyzeHeadingHierarchy;
    private analyzeLandmarks;
    private analyzeFocusableElements;
    private analyzeSemanticStructure;
    validateARIAAttributes(document: Document): Promise<{
        valid: ElementInfo[];
        invalid: ElementInfo[];
    }>;
    private createElementInfo;
    private getXPath;
    private getViewportInfo;
    private getInteractiveElements;
    private getImplicitRole;
    private getLandmarkLabel;
    private getTabIndex;
    private isElementVisible;
    private hasKeyboardEventHandlers;
    private validateElementARIA;
    private analyzeAccessibility;
    private measureAnalysisPerformance;
    private getEmptyPageStructure;
    private getEmptyAccessibilityAnalysis;
    private getEmptyPerformanceMetrics;
    updateConfig(newConfig: Partial<DOMAnalyzerConfig>): Promise<void>;
    getConfig(): DOMAnalyzerConfig;
    isCurrentlyAnalyzing(): boolean;
    shutdown(): Promise<void>;
}
export declare const domAnalyzer: DOMAnalyzer;
export default domAnalyzer;
//# sourceMappingURL=DOMAnalyzer.d.ts.map