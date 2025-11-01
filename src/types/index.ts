/**
 * AccessiAI Core Type Definitions
 * Modern TypeScript 5.6+ with strict typing
 */

// ============================================================================
// CORE SYSTEM TYPES
// ============================================================================

export interface AgentMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly dependencies: readonly string[];
  readonly status: AgentStatus;
  readonly lastHeartbeat: number;
  readonly performanceMetrics: PerformanceMetrics;
}

export type AgentStatus = 
  | 'initializing' 
  | 'active' 
  | 'idle' 
  | 'busy' 
  | 'error' 
  | 'shutting-down' 
  | 'offline';

export interface PerformanceMetrics {
  responseTime: number;        // milliseconds
  throughput: number;          // operations/second
  errorRate: number;           // percentage (0-1)
  resourceUsage: number;       // percentage (0-100)
  uptime: number;              // milliseconds
  lastUpdated: number;         // timestamp
}

// ============================================================================
// MESSAGE SYSTEM TYPES
// ============================================================================

export interface AgentMessage {
  readonly id: string;
  readonly type: MessageType;
  readonly source: string;
  readonly target: string | 'broadcast';
  readonly payload: MessagePayload;
  readonly timestamp: number;
  readonly priority: MessagePriority;
  readonly correlationId?: string;
  readonly replyTo?: string;
  readonly ttl?: number;       // time to live in milliseconds
}

export type MessageType = 
  | 'command' 
  | 'query' 
  | 'event' 
  | 'response' 
  | 'heartbeat' 
  | 'error';

export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';

export interface MessagePayload {
  readonly action: string;
  readonly data?: unknown;
  readonly metadata?: Record<string, unknown>;
}

export interface AgentResponse {
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: AgentError;
  readonly metadata?: Record<string, unknown>;
  readonly processingTime: number;
}

export interface AgentError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly stack?: string;
  readonly timestamp: number;
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface AccessibilityIssue {
  readonly id: string;
  readonly type: AccessibilityIssueType;
  readonly severity: IssueSeverity;
  readonly element: ElementInfo;
  readonly description: string;
  readonly wcagCriteria: readonly string[];
  readonly suggestedFix: string;
  readonly detectedAt: number;
  readonly confidence: number;    // 0-1 confidence score
}

export type AccessibilityIssueType = 
  | 'missing-alt-text'
  | 'insufficient-contrast'
  | 'keyboard-inaccessible'
  | 'missing-labels'
  | 'invalid-aria'
  | 'heading-structure'
  | 'focus-management'
  | 'semantic-markup'
  | 'color-only-information'
  | 'text-size'
  | 'link-purpose'
  | 'form-validation';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ElementInfo {
  readonly tagName: string;
  readonly id?: string;
  readonly className?: string;
  readonly xpath: string;
  readonly textContent?: string;
  readonly attributes: Record<string, string>;
  readonly boundingRect: DOMRect;
}

export interface AccessibilityAnalysis {
  readonly pageUrl: string;
  readonly analyzedAt: number;
  readonly issues: readonly AccessibilityIssue[];
  readonly complianceScore: number;    // 0-100 WCAG compliance score
  readonly totalElements: number;
  readonly processedElements: number;
  readonly analysisTime: number;       // milliseconds
}

// ============================================================================
// WCAG COMPLIANCE TYPES
// ============================================================================

export interface WCAGCriteria {
  readonly id: string;
  readonly level: 'A' | 'AA' | 'AAA';
  readonly principle: WCAGPrinciple;
  readonly guideline: string;
  readonly description: string;
  readonly successCriteria: string;
}

export type WCAGPrinciple = 
  | 'perceivable' 
  | 'operable' 
  | 'understandable' 
  | 'robust';

export interface ComplianceResult {
  readonly criteria: WCAGCriteria;
  readonly status: ComplianceStatus;
  readonly score: number;              // 0-1 compliance score
  readonly issues: readonly AccessibilityIssue[];
  readonly recommendations: readonly string[];
}

export type ComplianceStatus = 'pass' | 'fail' | 'partial' | 'not-applicable';

// ============================================================================
// DOM ANALYSIS TYPES
// ============================================================================

export interface PageContext {
  readonly url: string;
  readonly title: string;
  readonly dom: Document;
  readonly viewport: ViewportInfo;
  readonly styles: CSSStyleDeclaration;
  readonly interactiveElements: readonly Element[];
  readonly images: readonly HTMLImageElement[];
  readonly forms: readonly HTMLFormElement[];
  readonly headings: readonly HTMLHeadingElement[];
  readonly links: readonly HTMLAnchorElement[];
  readonly analyzedAt: number;
}

export interface ViewportInfo {
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio: number;
  readonly colorDepth: number;
  readonly orientation: 'portrait' | 'landscape';
}

export interface DOMAnalysisResult {
  readonly structure: PageStructure;
  readonly accessibility: AccessibilityAnalysis;
  readonly performance: AnalysisPerformance;
}

export interface PageStructure {
  readonly headingHierarchy: readonly HeadingInfo[];
  readonly landmarks: readonly LandmarkInfo[];
  readonly focusableElements: readonly FocusableElementInfo[];
  readonly semanticStructure: SemanticStructure;
}

export interface HeadingInfo {
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
  readonly text: string;
  readonly element: ElementInfo;
  readonly children: readonly HeadingInfo[];
}

export interface LandmarkInfo {
  readonly role: string;
  readonly label?: string;
  readonly element: ElementInfo;
  readonly children: readonly Element[];
}

export interface FocusableElementInfo {
  readonly element: ElementInfo;
  readonly tabIndex: number;
  readonly isVisible: boolean;
  readonly hasKeyboardHandler: boolean;
}

export interface SemanticStructure {
  readonly hasMain: boolean;
  readonly hasNavigation: boolean;
  readonly hasHeader: boolean;
  readonly hasFooter: boolean;
  readonly hasAside: boolean;
  readonly skipLinks: readonly ElementInfo[];
}

export interface AnalysisPerformance {
  readonly totalTime: number;          // milliseconds
  readonly domTraversalTime: number;   // milliseconds
  readonly accessibilityCheckTime: number; // milliseconds
  readonly elementsProcessed: number;
  readonly issuesFound: number;
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface StorageConfig {
  readonly dbName: string;
  readonly version: number;
  readonly stores: readonly ObjectStoreConfig[];
}

export interface ObjectStoreConfig {
  readonly name: string;
  readonly keyPath: string;
  readonly autoIncrement: boolean;
  readonly indexes: readonly IndexConfig[];
}

export interface IndexConfig {
  readonly name: string;
  readonly keyPath: string | readonly string[];
  readonly unique: boolean;
}

export interface EncryptedData {
  readonly data: Uint8Array;
  readonly iv: Uint8Array;
  readonly timestamp: number;
  readonly algorithm: string;
}

// ============================================================================
// USER PREFERENCES TYPES
// ============================================================================

export interface UserPreferences {
  readonly accessibility: AccessibilityPreferences;
  readonly ui: UIPreferences;
  readonly performance: PerformancePreferences;
  readonly privacy: PrivacyPreferences;
  readonly lastUpdated: number;
}

export interface AccessibilityPreferences {
  readonly enableHighContrast: boolean;
  readonly fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  readonly enableScreenReader: boolean;
  readonly enableKeyboardNavigation: boolean;
  readonly enableVoiceCommands: boolean;
  readonly colorBlindnessType?: 'protanopia' | 'deuteranopia' | 'tritanopia';
  readonly customRules: readonly CustomAccessibilityRule[];
}

export interface UIPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly panelPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  readonly showNotifications: boolean;
  readonly animationsEnabled: boolean;
  readonly compactMode: boolean;
}

export interface PerformancePreferences {
  readonly enableRealTimeScanning: boolean;
  readonly scanningInterval: number;      // milliseconds
  readonly maxConcurrentScans: number;
  readonly enableCaching: boolean;
  readonly cacheTimeout: number;          // milliseconds
}

export interface PrivacyPreferences {
  readonly enableTelemetry: boolean;
  readonly enableErrorReporting: boolean;
  readonly dataRetentionDays: number;
  readonly enableEncryption: boolean;
}

export interface CustomAccessibilityRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly selector: string;
  readonly checks: readonly AccessibilityCheck[];
  readonly enabled: boolean;
  readonly createdAt: number;
}

export interface AccessibilityCheck {
  readonly type: 'attribute' | 'style' | 'content' | 'structure';
  readonly property: string;
  readonly expectedValue?: string;
  readonly validator?: string;           // regex or function name
  readonly errorMessage: string;
}

// ============================================================================
// SYSTEM HEALTH TYPES
// ============================================================================

export interface SystemHealthReport {
  readonly timestamp: number;
  readonly overallStatus: SystemStatus;
  readonly agents: readonly AgentHealthInfo[];
  readonly performance: SystemPerformance;
  readonly resources: ResourceUsage;
  readonly errors: readonly SystemError[];
  readonly messageBus?: MessageBusStatus;
}

export interface MessageBusStatus {
  readonly metrics: {
    readonly responseTime: number;
    readonly throughput: number;
    readonly errorRate: number;
    readonly resourceUsage: number;
  };
  readonly queueStatus: {
    readonly size: number;
    readonly processing: boolean;
    readonly queueSizes: Record<string, number>;
  };
}

export type SystemStatus = 'healthy' | 'degraded' | 'critical' | 'offline';

export interface AgentHealthInfo {
  readonly agentId: string;
  readonly status: AgentStatus;
  readonly lastHeartbeat: number;
  readonly responseTime: number;
  readonly errorCount: number;
  readonly memoryUsage: number;
}

export interface SystemPerformance {
  readonly averageResponseTime: number;
  readonly totalThroughput: number;
  readonly systemErrorRate: number;
  readonly uptime: number;
}

export interface ResourceUsage {
  readonly memoryUsage: number;         // MB
  readonly cpuUsage: number;            // percentage
  readonly storageUsage: number;        // MB
  readonly networkUsage: number;        // bytes/second
}

export interface SystemError {
  readonly id: string;
  readonly type: 'agent-error' | 'system-error' | 'performance-error';
  readonly source: string;
  readonly message: string;
  readonly stack?: string;
  readonly timestamp: number;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly resolved: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Awaitable<T> = T | Promise<T>;

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface SystemEvent {
  readonly type: SystemEventType;
  readonly source: string;
  readonly data: unknown;
  readonly timestamp: number;
}

export type SystemEventType = 
  | 'agent-started'
  | 'agent-stopped'
  | 'agent-error'
  | 'message-sent'
  | 'message-received'
  | 'analysis-completed'
  | 'issue-detected'
  | 'issue-resolved'
  | 'performance-warning'
  | 'system-health-changed';

// ============================================================================
// CONSTANTS
// ============================================================================

export const PERFORMANCE_TARGETS = {
  COORDINATION_AGENT: {
    RESPONSE_TIME: 10,        // milliseconds
    THROUGHPUT: 1000,         // messages/second
    AVAILABILITY: 0.999       // 99.9% uptime
  },
  PERCEPTION_AGENT: {
    ANALYSIS_TIME: 100,       // milliseconds
    ACCURACY: 0.95,           // 95% accuracy
    COVERAGE: 1.0             // 100% WCAG coverage
  },
  SYSTEM_OVERALL: {
    MEMORY_USAGE: 75,         // MB maximum
    CPU_USAGE: 0.07,          // 7% maximum
    RESPONSE_TIME: 1000       // milliseconds
  }
} as const;

export const WCAG_LEVELS = ['A', 'AA', 'AAA'] as const;
export const WCAG_PRINCIPLES = ['perceivable', 'operable', 'understandable', 'robust'] as const;

// ============================================================================
// VISUAL ANALYSIS TYPES
// ============================================================================

export interface VisualAnalysisResult {
  readonly overallScore: number;
  readonly analysisTime: number;
  readonly imageAnalysis: {
    readonly issues: AccessibilityIssue[];
    readonly imageInfos: ImageAccessibilityInfo[];
  };
  readonly mediaAnalysis: {
    readonly issues: AccessibilityIssue[];
    readonly mediaInfos: MediaAccessibilityInfo[];
  };
  readonly layoutAnalysis: {
    readonly issues: AccessibilityIssue[];
  };
  readonly totalIssues: number;
  readonly criticalIssues: number;
  readonly warningIssues: number;
  readonly infoIssues: number;
  readonly timestamp: string;
}

export interface ImageAccessibilityInfo {
  readonly src: string;
  readonly alt: string;
  readonly title: string;
  readonly ariaLabel: string;
  readonly ariaLabelledBy: string;
  readonly role: string;
  readonly isDecorative: boolean;
  readonly hasAccessibleName: boolean;
  readonly elementInfo: ElementInfo;
}

export interface MediaAccessibilityInfo {
  readonly type: 'video' | 'audio';
  readonly src: string;
  readonly hasCaptions: boolean;
  readonly hasAudioDescription: boolean;
  readonly hasControls: boolean;
  readonly autoplay: boolean;
  readonly muted: boolean;
  readonly tracks: readonly MediaTrackInfo[];
  readonly elementInfo: ElementInfo;
}

export interface MediaTrackInfo {
  readonly kind: string;
  readonly src: string;
  readonly label: string;
  readonly srclang: string;
}

export interface LayoutAnalysisResult {
  readonly issues: AccessibilityIssue[];
}

// ============================================================================
// CONTENT STRUCTURE ANALYSIS TYPES
// ============================================================================

export interface ContentAnalysisResult {
  readonly overallScore: number;
  readonly analysisTime: number;
  readonly headingIssues: AccessibilityIssue[];
  readonly landmarkIssues: AccessibilityIssue[];
  readonly formIssues: AccessibilityIssue[];
  readonly totalIssues: number;
  readonly criticalIssues: number;
  readonly warningIssues: number;
  readonly infoIssues: number;
  readonly timestamp: string;
}

export interface HeadingHierarchyResult {
  readonly issues: AccessibilityIssue[];
  readonly headingStructure: HeadingInfo[];
}

export interface LandmarkValidationResult {
  readonly issues: AccessibilityIssue[];
  readonly landmarks: LandmarkInfo[];
}

export interface FormAccessibilityResult {
  readonly issues: AccessibilityIssue[];
  readonly formElements: FormElementInfo[];
}

export interface FormElementInfo {
  readonly type: string;
  readonly hasLabel: boolean;
  readonly labelType: 'explicit' | 'implicit' | 'aria-label' | 'aria-labelledby' | 'none';
  readonly isRequired: boolean;
  readonly hasValidation: boolean;
  readonly elementInfo: ElementInfo;
}

// ============================================================================
// AGENT LIFECYCLE TYPES
// ============================================================================

export interface AgentConfig {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly dependencies: readonly string[];
  readonly performanceTargets: PerformanceTargets;
  readonly healthCheckInterval: number;
  readonly maxRestartAttempts: number;
}

export interface PerformanceTargets {
  readonly responseTime: number;
  readonly throughput: number;
  readonly accuracy: number;
  readonly availability: number;
}

export interface AgentHealthStatus {
  readonly agentId: string;
  readonly status: AgentStatus;
  readonly lastHeartbeat: number;
  readonly performanceMetrics: PerformanceMetrics;
  readonly errorCount: number;
  readonly restartCount: number;
  readonly uptime: number;
}

// ============================================================================
// SETTINGS PANEL TYPES
// ============================================================================

export interface SettingsConfig {
  readonly general: GeneralSettings;
  readonly accessibility: AccessibilitySettings;
  readonly performance: PerformanceSettings;
  readonly privacy: PrivacySettings;
  readonly advanced: AdvancedSettings;
  readonly lastUpdated: number;
}

export interface GeneralSettings {
  readonly enableExtension: boolean;
  readonly autoScanPages: boolean;
  readonly showNotifications: boolean;
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: string;
}

export interface AccessibilitySettings {
  readonly profile: AccessibilityProfile;
  readonly customRules: readonly CustomRule[];
  readonly wcagLevel: 'A' | 'AA' | 'AAA';
  readonly enableVoiceCommands: boolean;
  readonly keyboardShortcuts: KeyboardShortcuts;
}

export interface AccessibilityProfile {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly settings: ProfileSettings;
  readonly isDefault: boolean;
  readonly isCustom: boolean;
}

export interface ProfileSettings {
  readonly highContrast: boolean;
  readonly largeText: boolean;
  readonly reducedMotion: boolean;
  readonly screenReaderOptimized: boolean;
  readonly keyboardNavigation: boolean;
  readonly colorBlindSupport: boolean;
  readonly cognitiveSupport: boolean;
}

export interface CustomRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly selector: string;
  readonly condition: RuleCondition;
  readonly action: RuleAction;
  readonly enabled: boolean;
  readonly priority: 'low' | 'medium' | 'high';
}

export interface RuleCondition {
  readonly type: 'attribute' | 'style' | 'content' | 'structure';
  readonly property: string;
  readonly operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  readonly value: string;
}

export interface RuleAction {
  readonly type: 'highlight' | 'fix' | 'warn' | 'ignore';
  readonly parameters: Record<string, unknown>;
}

export interface KeyboardShortcuts {
  readonly togglePanel: string;
  readonly scanPage: string;
  readonly fixIssues: string;
  readonly nextIssue: string;
  readonly previousIssue: string;
  readonly showHelp: string;
}

export interface PerformanceSettings {
  readonly realTimeScanning: boolean;
  readonly scanInterval: number;
  readonly maxConcurrentScans: number;
  readonly enableCaching: boolean;
  readonly cacheTimeout: number;
  readonly batchSize: number;
}

export interface PrivacySettings {
  readonly localProcessingOnly: boolean;
  readonly enableTelemetry: boolean;
  readonly enableErrorReporting: boolean;
  readonly dataRetentionDays: number;
  readonly enableEncryption: boolean;
  readonly anonymizeData: boolean;
}

export interface AdvancedSettings {
  readonly debugMode: boolean;
  readonly verboseLogging: boolean;
  readonly experimentalFeatures: boolean;
  readonly customCSSInjection: boolean;
  readonly developerMode: boolean;
  readonly performanceMonitoring: boolean;
}

export interface SettingsValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly SettingsError[];
  readonly warnings: readonly SettingsWarning[];
}

export interface SettingsError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface SettingsWarning {
  readonly field: string;
  readonly message: string;
  readonly suggestion: string;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export interface FilterSettings {
  readonly severity: readonly IssueSeverity[];
  readonly type: readonly AccessibilityIssueType[];
  readonly showResolved: boolean;
  readonly searchText: string;
}

export interface DragHandler {
  readonly isDragging: boolean;
  readonly startPosition: { x: number; y: number };
  readonly currentPosition: { x: number; y: number };
}

// Update the existing AccessibilityIssue interface to include category
declare module './index' {
  interface AccessibilityIssue {
    readonly category?: 'visual' | 'content' | 'structure' | 'interaction' | 'general';
  }
}