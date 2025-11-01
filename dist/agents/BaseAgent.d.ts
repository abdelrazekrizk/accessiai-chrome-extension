/**
 * BaseAgent - Abstract Foundation Class for All AccessiAI Agents
 * Modern TypeScript 5.6+ with strict typing and performance monitoring
 */
import type { AgentMetadata, AgentStatus, AgentMessage, AgentResponse, AgentError, PerformanceMetrics, SystemEvent, SystemEventType } from '../types/index';
export declare abstract class BaseAgent {
    protected readonly agentId: string;
    protected readonly agentName: string;
    protected readonly agentVersion: string;
    protected readonly capabilities: readonly string[];
    protected readonly dependencies: readonly string[];
    protected status: AgentStatus;
    protected lastHeartbeat: number;
    protected initializationTime: number;
    protected shutdownTime: number;
    protected performanceMetrics: PerformanceMetrics;
    protected eventListeners: Map<SystemEventType, Array<(event: SystemEvent) => void>>;
    protected errorCount: number;
    protected lastError: AgentError | null;
    constructor(metadata: Omit<AgentMetadata, 'status' | 'lastHeartbeat' | 'performanceMetrics'>);
    /**
     * Initialize the agent and its resources
     * Must complete within reasonable time limits
     */
    abstract initialize(): Promise<void>;
    /**
     * Shutdown the agent and cleanup resources
     * Must handle graceful shutdown scenarios
     */
    abstract shutdown(): Promise<void>;
    /**
     * Process incoming messages from other agents
     * Must return response within performance targets
     */
    abstract processMessage(message: AgentMessage): Promise<AgentResponse>;
    /**
     * Get current agent configuration
     * Used for debugging and monitoring
     */
    abstract getConfiguration(): Record<string, unknown>;
    /**
     * Start the agent lifecycle
     * Handles initialization and error recovery
     */
    start(): Promise<void>;
    /**
     * Stop the agent lifecycle
     * Handles graceful shutdown and cleanup
     */
    stop(): Promise<void>;
    /**
     * Get current agent metadata
     */
    getMetadata(): AgentMetadata;
    /**
     * Get current agent status
     */
    getStatus(): AgentStatus;
    /**
     * Check if agent is healthy and operational
     */
    isHealthy(): boolean;
    /**
     * Update heartbeat timestamp
     */
    updateHeartbeat(): void;
    /**
     * Record a performance metric
     */
    protected recordMetric(name: string, value: number, timestamp?: number): void;
    /**
     * Calculate moving average for metrics
     */
    private calculateMovingAverage;
    /**
     * Start performance tracking
     */
    private startPerformanceTracking;
    /**
     * Stop performance tracking
     */
    private stopPerformanceTracking;
    /**
     * Create a standardized agent error
     */
    protected createAgentError(code: string, message: string, originalError?: unknown): AgentError;
    /**
     * Record an error and update metrics
     */
    protected recordError(error: AgentError): void;
    /**
     * Emit a system event
     */
    protected emitEvent(type: SystemEventType, data: unknown): void;
    /**
     * Add event listener
     */
    addEventListener(type: SystemEventType, listener: (event: SystemEvent) => void): void;
    /**
     * Remove event listener
     */
    removeEventListener(type: SystemEventType, listener: (event: SystemEvent) => void): void;
    /**
     * Validate incoming message format
     */
    protected validateMessage(message: AgentMessage): boolean;
    /**
     * Create a standardized response
     */
    protected createResponse(success: boolean, data?: unknown, error?: AgentError, processingTime?: number): AgentResponse;
    /**
     * Create a success response
     */
    protected createSuccessResponse(data?: unknown, processingTime?: number): AgentResponse;
    /**
     * Create an error response
     */
    protected createErrorResponse(error: AgentError, processingTime?: number): AgentResponse;
    /**
     * Check if agent has specific capability
     */
    hasCapability(capability: string): boolean;
    /**
     * Check if agent has dependency
     */
    hasDependency(dependency: string): boolean;
    /**
     * Get agent uptime in milliseconds
     */
    getUptime(): number;
    /**
     * Get formatted agent info for logging
     */
    toString(): string;
}
//# sourceMappingURL=BaseAgent.d.ts.map