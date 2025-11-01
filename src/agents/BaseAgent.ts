/**
 * BaseAgent - Abstract Foundation Class for All AccessiAI Agents
 * Modern TypeScript 5.6+ with strict typing and performance monitoring
 */

import type {
  AgentMetadata,
  AgentStatus,
  AgentMessage,
  AgentResponse,
  AgentError,
  PerformanceMetrics,
  SystemEvent,
  SystemEventType
} from '../types/index';

export abstract class BaseAgent {
  // ============================================================================
  // CORE PROPERTIES
  // ============================================================================

  protected readonly agentId: string;
  protected readonly agentName: string;
  protected readonly agentVersion: string;
  protected readonly capabilities: readonly string[];
  protected readonly dependencies: readonly string[];

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  protected status: AgentStatus = 'initializing';
  protected lastHeartbeat: number = Date.now();
  protected initializationTime: number = 0;
  protected shutdownTime: number = 0;

  // ============================================================================
  // PERFORMANCE TRACKING
  // ============================================================================

  protected performanceMetrics: PerformanceMetrics = {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    resourceUsage: 0,
    uptime: 0,
    lastUpdated: Date.now()
  };

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  protected eventListeners: Map<SystemEventType, Array<(event: SystemEvent) => void>> = new Map();

  // ============================================================================
  // ERROR TRACKING
  // ============================================================================

  protected errorCount: number = 0;
  protected lastError: AgentError | null = null;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(metadata: Omit<AgentMetadata, 'status' | 'lastHeartbeat' | 'performanceMetrics'>) {
    this.agentId = metadata.id;
    this.agentName = metadata.name;
    this.agentVersion = metadata.version;
    this.capabilities = Object.freeze([...metadata.capabilities]);
    this.dependencies = Object.freeze([...metadata.dependencies]);

    // Initialize performance tracking
    this.startPerformanceTracking();
  }

  // ============================================================================
  // ABSTRACT METHODS (Must be implemented by subclasses)
  // ============================================================================

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

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Start the agent lifecycle
   * Handles initialization and error recovery
   */
  async start(): Promise<void> {
    try {
      this.status = 'initializing';
      this.initializationTime = Date.now();
      
      await this.initialize();
      
      this.status = 'active';
      this.updateHeartbeat();
      this.emitEvent('agent-started', { agentId: this.agentId });
      
      console.log(`[${this.agentName}] Agent started successfully`);
    } catch (error) {
      this.status = 'error';
      const agentError = this.createAgentError('INITIALIZATION_FAILED', 'Failed to initialize agent', error);
      this.recordError(agentError);
      this.emitEvent('agent-error', { agentId: this.agentId, error: agentError });
      throw agentError;
    }
  }

  /**
   * Stop the agent lifecycle
   * Handles graceful shutdown and cleanup
   */
  async stop(): Promise<void> {
    try {
      this.status = 'shutting-down';
      this.shutdownTime = Date.now();
      
      await this.shutdown();
      
      this.status = 'offline';
      this.stopPerformanceTracking();
      this.emitEvent('agent-stopped', { agentId: this.agentId });
      
      console.log(`[${this.agentName}] Agent stopped successfully`);
    } catch (error) {
      this.status = 'error';
      const agentError = this.createAgentError('SHUTDOWN_FAILED', 'Failed to shutdown agent', error);
      this.recordError(agentError);
      this.emitEvent('agent-error', { agentId: this.agentId, error: agentError });
      throw agentError;
    }
  }

  // ============================================================================
  // STATUS AND HEALTH
  // ============================================================================

  /**
   * Get current agent metadata
   */
  getMetadata(): AgentMetadata {
    return {
      id: this.agentId,
      name: this.agentName,
      version: this.agentVersion,
      capabilities: this.capabilities,
      dependencies: this.dependencies,
      status: this.status,
      lastHeartbeat: this.lastHeartbeat,
      performanceMetrics: { ...this.performanceMetrics }
    };
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Check if agent is healthy and operational
   */
  isHealthy(): boolean {
    const now = Date.now();
    const heartbeatAge = now - this.lastHeartbeat;
    const maxHeartbeatAge = 30000; // 30 seconds
    
    return this.status === 'active' && 
           heartbeatAge < maxHeartbeatAge &&
           this.performanceMetrics.errorRate < 0.1; // Less than 10% error rate
  }

  /**
   * Update heartbeat timestamp
   */
  updateHeartbeat(): void {
    this.lastHeartbeat = Date.now();
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  /**
   * Record a performance metric
   */
  protected recordMetric(name: string, value: number, timestamp: number = Date.now()): void {
    switch (name) {
      case 'response_time':
        this.performanceMetrics.responseTime = this.calculateMovingAverage(
          this.performanceMetrics.responseTime,
          value,
          0.1 // 10% weight for new values
        );
        break;
      
      case 'throughput':
        this.performanceMetrics.throughput = value;
        break;
      
      case 'error_rate':
        this.performanceMetrics.errorRate = this.calculateMovingAverage(
          this.performanceMetrics.errorRate,
          value,
          0.1
        );
        break;
      
      case 'resource_usage':
        this.performanceMetrics.resourceUsage = value;
        break;
    }
    
    this.performanceMetrics.lastUpdated = timestamp;
  }

  /**
   * Calculate moving average for metrics
   */
  private calculateMovingAverage(current: number, newValue: number, weight: number): number {
    return current * (1 - weight) + newValue * weight;
  }

  /**
   * Start performance tracking
   */
  private startPerformanceTracking(): void {
    // Update uptime every second
    setInterval(() => {
      if (this.status === 'active') {
        this.performanceMetrics.uptime = Date.now() - this.initializationTime;
        this.performanceMetrics.lastUpdated = Date.now();
      }
    }, 1000);
  }

  /**
   * Stop performance tracking
   */
  private stopPerformanceTracking(): void {
    // Performance tracking stops automatically when agent is offline
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Create a standardized agent error
   */
  protected createAgentError(code: string, message: string, originalError?: unknown): AgentError {
    const error: AgentError = {
      code,
      message,
      details: originalError,
      timestamp: Date.now()
    };
    
    if (originalError instanceof Error && originalError.stack) {
      (error as any).stack = originalError.stack;
    }
    
    return error;
  }

  /**
   * Record an error and update metrics
   */
  protected recordError(error: AgentError): void {
    this.errorCount++;
    this.lastError = error;
    
    // Update error rate metric
    const errorRate = this.errorCount / Math.max(1, this.performanceMetrics.uptime / 1000);
    this.recordMetric('error_rate', errorRate);
    
    console.error(`[${this.agentName}] Error:`, error);
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Emit a system event
   */
  protected emitEvent(type: SystemEventType, data: unknown): void {
    const event: SystemEvent = {
      type,
      source: this.agentId,
      data,
      timestamp: Date.now()
    };

    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`[${this.agentName}] Event listener error:`, error);
      }
    });
  }

  /**
   * Add event listener
   */
  addEventListener(type: SystemEventType, listener: (event: SystemEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: SystemEventType, listener: (event: SystemEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // ============================================================================
  // MESSAGE HANDLING UTILITIES
  // ============================================================================

  /**
   * Validate incoming message format
   */
  protected validateMessage(message: AgentMessage): boolean {
    return !!(
      message.id &&
      message.type &&
      message.source &&
      message.target &&
      message.payload &&
      typeof message.timestamp === 'number'
    );
  }

  /**
   * Create a standardized response
   */
  protected createResponse(
    success: boolean,
    data?: unknown,
    error?: AgentError,
    processingTime: number = 0
  ): AgentResponse {
    const response: AgentResponse = {
      success,
      metadata: {
        agentId: this.agentId,
        agentName: this.agentName,
        timestamp: Date.now()
      },
      processingTime
    };
    
    if (data !== undefined) {
      (response as any).data = data;
    }
    
    if (error !== undefined) {
      (response as any).error = error;
    }
    
    return response;
  }

  /**
   * Create a success response
   */
  protected createSuccessResponse(data?: unknown, processingTime: number = 0): AgentResponse {
    return this.createResponse(true, data, undefined, processingTime);
  }

  /**
   * Create an error response
   */
  protected createErrorResponse(error: AgentError, processingTime: number = 0): AgentResponse {
    return this.createResponse(false, undefined, error, processingTime);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if agent has specific capability
   */
  hasCapability(capability: string): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Check if agent has dependency
   */
  hasDependency(dependency: string): boolean {
    return this.dependencies.includes(dependency);
  }

  /**
   * Get agent uptime in milliseconds
   */
  getUptime(): number {
    return this.status === 'active' ? Date.now() - this.initializationTime : 0;
  }

  /**
   * Get formatted agent info for logging
   */
  toString(): string {
    return `${this.agentName} (${this.agentId}) - Status: ${this.status}`;
  }
}