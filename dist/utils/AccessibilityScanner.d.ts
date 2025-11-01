/**
 * AccessiAI Accessibility Scanner - WCAG Compliance Issue Detection
 * WCAG 2.1 AA compliance scanning with color contrast and keyboard accessibility
 * Provides comprehensive accessibility analysis with automated issue detection
 * Target: <100ms analysis time with 95% accuracy
 */
import type { AccessibilityIssueType, AccessibilityAnalysis, ComplianceResult } from '../types/index';
export interface AccessibilityScannerConfig {
    readonly enableColorContrastCheck: boolean;
    readonly enableKeyboardAccessibilityCheck: boolean;
    readonly enableARIAValidation: boolean;
    readonly enableFormValidation: boolean;
    readonly wcagLevel: 'A' | 'AA' | 'AAA';
    readonly maxScanTime: number;
    readonly minContrastRatio: number;
    readonly includeHiddenElements: boolean;
}
export interface ScanOptions {
    readonly targetElements?: Element[];
    readonly skipElements?: string[];
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
export declare class AccessibilityScanner {
    private isScanning;
    private scanStartTime;
    private detectedIssues;
    private processedElements;
    private config;
    private readonly SCAN_TIME_TARGET;
    private readonly WCAG_CRITERIA;
    private static instance;
    static getInstance(): AccessibilityScanner;
    private constructor();
    scanPage(document: Document, options?: ScanOptions): Promise<AccessibilityAnalysis>;
    private scanForMissingAltText;
    private scanForColorContrastIssues;
    private scanForKeyboardAccessibilityIssues;
    private scanForARIAIssues;
    private scanForFormAccessibilityIssues;
    private scanForHeadingStructureIssues;
    private scanForFocusManagementIssues;
    private analyzeColorContrast;
    private analyzeKeyboardAccessibility;
    private getElementsToScan;
    private createIssue;
    private createBasicElementInfo;
    private createElementInfo;
    private getSimpleXPath;
    private calculateComplianceScore;
    private getSeverityWeight;
    private calculateConfidence;
    private isInteractiveElement;
    private shouldBeFocusable;
    private isFocusable;
    private hasProperTabIndex;
    private hasKeyboardEventHandlers;
    private hasVisibleFocusStyles;
    private isInTabOrder;
    private requiresKeyboardHandlers;
    private hasARIAAttributes;
    private isFormElement;
    private isElementVisible;
    private calculateContrastRatio;
    private getRelativeLuminance;
    private parseColor;
    private getEffectiveBackgroundColor;
    private isLargeText;
    private validateARIAImplementation;
    private validateFormAccessibility;
    private isValidARIARole;
    private requiresAccessibleName;
    updateConfig(newConfig: Partial<AccessibilityScannerConfig>): Promise<void>;
    getConfig(): AccessibilityScannerConfig;
    isCurrentlyScanning(): boolean;
    validateWCAGCompliance(_element: Element, criteria: string): Promise<ComplianceResult>;
    shutdown(): Promise<void>;
}
export declare const accessibilityScanner: AccessibilityScanner;
export default accessibilityScanner;
//# sourceMappingURL=AccessibilityScanner.d.ts.map