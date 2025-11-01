/**
 * AccessiAI Agent Lifecycle Manager
 * Manages agent initialization, health monitoring, and automatic recovery
 * Provides comprehensive agent lifecycle management with failure recovery
 * Optimized for fast health checks and automatic failure recovery
 */

import type {
  AgentStatus,
  SystemHealthReport,
  AgentHealthInfo,
  SystemStatus
} from '../types/index';
import { BaseAgent } from '../agents/BaseAgent';
import { messageBus } from './MessageBus';

// ============================================================================
// LIFECYCLE MANAGER INTERFACES
// ============================================================================

export interface AgentConfig {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly dependencies: readonly string[];
  readonly priority: number;
  readonly autoRestart: boolean;
  readonly maxRestartAttempts: number;
  readonly healthCheckInterval: number;
}

export interface AgentInstance {
  readonly config: AgentConfig;
  readonly agent: BaseAgent;
  readonly startTime: number;
  readonly restartCount: number;
  readonly lastHealthCheck: number;
  readonly status: AgentStatus;
}

export interface LifecycleConfig {
  readonly healthCheckInterval: number;
  readonly maxRestartAttempts: number;
  readonly restartDelay: number;
  readonly shutdownTimeout: number;
  readonly startupTimeout: number;
}

// ============================================================================
// AGENT LIFECYCLE MANAGER IMPLEMENTATION
// ============================================================================

export class AgentLifecycleManager {
  // ============================================================================
  // CORE PROPERTIES
  // ============================================================================

  private agents: Map<string, AgentInstance> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;
  private startupPromises: Map<string, Promise<void>> = new Map();

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private config: LifecycleConfig = {
    healthCheckInterval: 5000,    // 5 seconds
    maxRestartAttempts: 3,
    restartDelay: 2000,          // 2 seconds
    shutdownTimeout: 10000,      // 10 seconds
    startupTimeout: 30000        // 30 seconds
  };

  // ============================================================================
  // PERFORMANCE METRICS
  // ============================================================================

  private metrics = {
    totalAgents: 0,
    activeAgents: 0,
    failedAgents: 0,
    restartCount: 0,
    lastHealthCheckTime: 0,
    averageHealthCheckTime: 0
  };

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  private static instance: AgentLifecycleManager | null = null;

  static getInstance(): AgentLifecycleManager {
    if (!AgentLifecycleManager.instance) {
      AgentLifecycleManager.instance = new AgentLifecycleManager();
    }
    return AgentLifecycleManager.instance;
  }

  private constructor() {
    this.startHealthMonitoring();
    console.log('[AgentLifecycleManager] Initialized with comprehensive health monitoring');
  }

  // ============================================================================
  // AGENT REGISTRATION
  // ============================================================================

  /**
   * Register an agent for lifecycle management
   */
  async registerAgent(config: AgentConfig, agentFactory: () => BaseAgent): Promise<void> {
    try {
      if (this.agents.has(config.id)) {
        throw new Error(`Agent ${config.id} is already registered`);
      }

      console.log(`[AgentLifecycleManager] Registering agent: ${config.name}`);

      // Create agent instance
      const agent = agentFactory();
      
      // Create agent instance record
      const agentInstance: AgentInstance = {
        config,
        agent,
        startTime: 0,
        restartCount: 0,
        lastHealthCheck: 0,
        status: 'initializing'
      };

      // Register with lifecycle manager
      this.agents.set(config.id, agentInstance);
      this.metrics.totalAgents++;

      // Subscribe to agent events
      this.subscribeToAgentEvents(agent);

      console.log(`[AgentLifecycleManager] Agent ${config.name} registered successfully`);

    } catch (error) {
      console.error(`[AgentLifecycleManager] Failed to register agent ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Unregister an agent from lifecycle management
   */
  async unregisterAgent(agentId: string): Promise<void> {
    try {
      const agentInstance = this.agents.get(agentId);
      if (!agentInstance) {
        console.warn(`[AgentLifecycleManager] Agent ${agentId} not found for unregistration`);
        return;
      }

      console.log(`[AgentLifecycleManager] Unregistering agent: ${agentInstance.config.name}`);

      // Stop the agent if running
      if (agentInstance.status === 'active') {
        await this.stopAgent(agentId);
      }

      // Remove from registry
      this.agents.delete(agentId);
      this.metrics.totalAgents--;

      console.log(`[AgentLifecycleManager] Agent ${agentInstance.config.name} unregistered`);

    } catch (error) {
      console.error(`[AgentLifecycleManager] Failed to unregister agent ${agentId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // AGENT LIFECYCLE OPERATIONS
  // ============================================================================

  /**
   * Start a specific agent
   */
  async startAgent(agentId: string): Promise<void> {
    const agentInstance = this.agents.get(agentId);
    if (!agentInstance) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Check if already starting
    if (this.startupPromises.has(agentId)) {
      return this.startupPromises.get(agentId)!;
    }

    const startupPromise = this.performAgentStartup(agentInstance);
    this.startupPromises.set(agentId, startupPromise);

    try {
      await startupPromise;
    } finally {
      this.startupPromises.delete(agentId);
    }
  }

  /**
   * Stop a specific agent
   */
  async stopAgent(agentId: string): Promise<void> {
    const agentInstance = this.agents.get(agentId);
    if (!agentInstance) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      console.log(`[AgentLifecycleManager] Stopping agent: ${agentInstance.config.name}`);

      // Update status
      this.updateAgentStatus(agentId, 'shutting-down');

      // Stop the agent with timeout
      const stopPromise = agentInstance.agent.stop();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Shutdown timeout')), this.config.shutdownTimeout);
      });

      await Promise.race([stopPromise, timeoutPromise]);

      // Update metrics
      this.metrics.activeAgents--;
      this.updateAgentStatus(agentId, 'offline');

      console.log(`[AgentLifecycleManager] Agent ${agentInstance.config.name} stopped successfully`);

    } catch (error) {
      console.error(`[AgentLifecycleManager] Failed to stop agent ${agentInstance.config.name}:`, error);
      this.updateAgentStatus(agentId, 'error');
      throw error;
    }
  }

  /**
   * Start all registered agents
   */
  async startAllAgents(): Promise<void> {
    console.log('[AgentLifecycleManager] Starting all agents...');

    // Sort agents by priority (higher priority first)
    const sortedAgents = Array.from(this.agents.values())
      .sort((a, b) => b.config.priority - a.config.priority);

    // Start agents in priority order
    for (const agentInstance of sortedAgents) {
      try {
        await this.startAgent(agentInstance.config.id);
      } catch (error) {
        console.error(`[AgentLifecycleManager] Failed to start agent ${agentInstance.config.name}:`, error);
        
        // Continue with other agents unless this is a critical dependency
        if (agentInstance.config.priority > 90) {
          throw error; // Critical agent failure
        }
      }
    }

    console.log('[AgentLifecycleManager] All agents startup completed');
  }

  /**
   * Stop all agents
   */
  async stopAllAgents(): Promise<void> {
    console.log('[AgentLifecycleManager] Stopping all agents...');
    this.isShuttingDown = true;

    // Stop health monitoring
    this.stopHealthMonitoring();

    // Sort agents by reverse priority (lower priority stopped first)
    const sortedAgents = Array.from(this.agents.values())
      .sort((a, b) => a.config.priority - b.config.priority);

    // Stop agents in reverse priority order
    const stopPromises = sortedAgents.map(async (agentInstance) => {
      try {
        await this.stopAgent(agentInstance.config.id);
      } catch (error) {
        console.error(`[AgentLifecycleManager] Failed to stop agent ${agentInstance.config.name}:`, error);
      }
    });

    await Promise.allSettled(stopPromises);
    console.log('[AgentLifecycleManager] All agents stopped');
  }

  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================

  /**
   * Start health monitoring for all agents
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      return; // Already running
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    console.log('[AgentLifecycleManager] Health monitoring started');
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    console.log('[AgentLifecycleManager] Health monitoring stopped');
  }

  /**
   * Perform health checks on all active agents
   */
  private async performHealthChecks(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    const startTime = performance.now();
    const healthCheckPromises: Promise<void>[] = [];

    for (const [agentId, agentInstance] of this.agents) {
      if (agentInstance.status === 'active') {
        healthCheckPromises.push(this.checkAgentHealth(agentId));
      }
    }

    await Promise.allSettled(healthCheckPromises);

    // Update metrics
    const checkTime = performance.now() - startTime;
    this.metrics.lastHealthCheckTime = checkTime;
    this.metrics.averageHealthCheckTime = 
      (this.metrics.averageHealthCheckTime * 0.9) + (checkTime * 0.1);
  }

  /**
   * Check health of a specific agent
   */
  private async checkAgentHealth(agentId: string): Promise<void> {
    const agentInstance = this.agents.get(agentId);
    if (!agentInstance) {
      return;
    }

    try {
      const isHealthy = agentInstance.agent.isHealthy();
      const now = Date.now();

      // Update last health check time
      this.updateAgentInstance(agentId, { lastHealthCheck: now });

      if (!isHealthy) {
        console.warn(`[AgentLifecycleManager] Agent ${agentInstance.config.name} health check failed`);
        await this.handleAgentFailure(agentId, new Error('Health check failed'));
      } else {
        // Update heartbeat
        agentInstance.agent.updateHeartbeat();
      }

    } catch (error) {
      console.error(`[AgentLifecycleManager] Health check error for ${agentInstance.config.name}:`, error);
      await this.handleAgentFailure(agentId, error as Error);
    }
  }

  // ============================================================================
  // FAILURE RECOVERY
  // ============================================================================

  /**
   * Handle agent failure and attempt recovery
   */
  private async handleAgentFailure(agentId: string, error: Error): Promise<void> {
    const agentInstance = this.agents.get(agentId);
    if (!agentInstance || this.isShuttingDown) {
      return;
    }

    console.error(`[AgentLifecycleManager] Agent ${agentInstance.config.name} failed:`, error);

    // Update status
    this.updateAgentStatus(agentId, 'error');
    this.metrics.failedAgents++;

    // Check if auto-restart is enabled and within limits
    if (agentInstance.config.autoRestart && 
        agentInstance.restartCount < agentInstance.config.maxRestartAttempts) {
      
      console.log(`[AgentLifecycleManager] Attempting to restart ${agentInstance.config.name} (attempt ${agentInstance.restartCount + 1})`);
      
      // Wait before restart
      await new Promise(resolve => setTimeout(resolve, this.config.restartDelay));
      
      try {
        // Increment restart count
        this.updateAgentInstance(agentId, { 
          restartCount: agentInstance.restartCount + 1 
        });

        // Attempt restart
        await this.restartAgent(agentId);
        this.metrics.restartCount++;

        console.log(`[AgentLifecycleManager] Agent ${agentInstance.config.name} restarted successfully`);

      } catch (restartError) {
        console.error(`[AgentLifecycleManager] Failed to restart ${agentInstance.config.name}:`, restartError);
        
        // If max attempts reached, mark as permanently failed
        if (agentInstance.restartCount >= agentInstance.config.maxRestartAttempts) {
          console.error(`[AgentLifecycleManager] Agent ${agentInstance.config.name} exceeded max restart attempts`);
          this.updateAgentStatus(agentId, 'offline');
        }
      }
    } else {
      console.error(`[AgentLifecycleManager] Agent ${agentInstance.config.name} will not be restarted`);
    }

    // Emit failure event
    await this.emitSystemEvent('agent-failure', {
      agentId,
      agentName: agentInstance.config.name,
      error: error.message,
      restartCount: agentInstance.restartCount
    });
  }

  /**
   * Restart a failed agent
   */
  private async restartAgent(agentId: string): Promise<void> {
    // Stop the agent first
    try {
      await this.stopAgent(agentId);
    } catch (error) {
      console.warn(`[AgentLifecycleManager] Error stopping agent during restart:`, error);
    }

    // Start the agent again
    await this.startAgent(agentId);
  }

  // ============================================================================
  // SYSTEM HEALTH REPORTING
  // ============================================================================

  /**
   * Get comprehensive system health report
   */
  getSystemHealth(): SystemHealthReport {
    const agents: AgentHealthInfo[] = Array.from(this.agents.values()).map(agentInstance => ({
      agentId: agentInstance.config.id,
      status: agentInstance.status,
      lastHeartbeat: agentInstance.agent.getMetadata().lastHeartbeat,
      responseTime: agentInstance.agent.getMetadata().performanceMetrics.responseTime,
      errorCount: agentInstance.restartCount,
      memoryUsage: agentInstance.agent.getMetadata().performanceMetrics.resourceUsage
    }));

    // Calculate overall system status
    const overallStatus = this.calculateSystemStatus(agents);

    return {
      timestamp: Date.now(),
      overallStatus,
      agents,
      performance: {
        averageResponseTime: this.metrics.averageHealthCheckTime,
        totalThroughput: this.metrics.activeAgents,
        systemErrorRate: this.metrics.failedAgents / Math.max(this.metrics.totalAgents, 1),
        uptime: Date.now()
      },
      resources: {
        memoryUsage: this.calculateTotalMemoryUsage(),
        cpuUsage: this.calculateTotalCpuUsage(),
        storageUsage: 0,
        networkUsage: 0
      },
      errors: []
    };
  }

  /**
   * Get agent registry information
   */
  getAgentRegistry(): Map<string, AgentInstance> {
    return new Map(this.agents);
  }

  /**
   * Get lifecycle metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Perform actual agent startup
   */
  private async performAgentStartup(agentInstance: AgentInstance): Promise<void> {
    try {
      console.log(`[AgentLifecycleManager] Starting agent: ${agentInstance.config.name}`);

      // Update status
      this.updateAgentStatus(agentInstance.config.id, 'initializing');

      // Start the agent with timeout
      const startPromise = agentInstance.agent.start();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Startup timeout')), this.config.startupTimeout);
      });

      await Promise.race([startPromise, timeoutPromise]);

      // Update instance data
      this.updateAgentInstance(agentInstance.config.id, {
        startTime: Date.now(),
        lastHealthCheck: Date.now()
      });

      // Update metrics
      this.metrics.activeAgents++;
      this.updateAgentStatus(agentInstance.config.id, 'active');

      console.log(`[AgentLifecycleManager] Agent ${agentInstance.config.name} started successfully`);

    } catch (error) {
      console.error(`[AgentLifecycleManager] Failed to start agent ${agentInstance.config.name}:`, error);
      this.updateAgentStatus(agentInstance.config.id, 'error');
      throw error;
    }
  }

  /**
   * Subscribe to agent events
   */
  private subscribeToAgentEvents(agent: BaseAgent): void {
    agent.addEventListener('agent-error', async (event) => {
      console.error('[AgentLifecycleManager] Agent error event:', event);
    });

    agent.addEventListener('agent-started', async (event) => {
      console.log('[AgentLifecycleManager] Agent started event:', event);
    });

    agent.addEventListener('agent-stopped', async (event) => {
      console.log('[AgentLifecycleManager] Agent stopped event:', event);
    });
  }

  /**
   * Update agent status
   */
  private updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agentInstance = this.agents.get(agentId);
    if (agentInstance) {
      this.updateAgentInstance(agentId, { status });
    }
  }

  /**
   * Update agent instance data
   */
  private updateAgentInstance(agentId: string, updates: Partial<AgentInstance>): void {
    const agentInstance = this.agents.get(agentId);
    if (agentInstance) {
      const updatedInstance = { ...agentInstance, ...updates };
      this.agents.set(agentId, updatedInstance);
    }
  }

  /**
   * Calculate overall system status
   */
  private calculateSystemStatus(agents: AgentHealthInfo[]): SystemStatus {
    if (agents.length === 0) {
      return 'offline';
    }

    const activeAgents = agents.filter(a => a.status === 'active').length;
    const errorAgents = agents.filter(a => a.status === 'error').length;
    
    if (errorAgents > agents.length * 0.5) {
      return 'critical';
    } else if (errorAgents > 0 || activeAgents < agents.length * 0.8) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Calculate total memory usage
   */
  private calculateTotalMemoryUsage(): number {
    return Array.from(this.agents.values())
      .reduce((total, agent) => total + agent.agent.getMetadata().performanceMetrics.resourceUsage, 0);
  }

  /**
   * Calculate total CPU usage
   */
  private calculateTotalCpuUsage(): number {
    // Simplified CPU calculation based on active agents
    return (this.metrics.activeAgents / Math.max(this.metrics.totalAgents, 1)) * 100;
  }

  /**
   * Emit system event
   */
  private async emitSystemEvent(type: string, data: any): Promise<void> {
    try {
      await messageBus.publish('system-events', {
        id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type: 'event',
        source: 'lifecycle-manager',
        target: 'broadcast',
        payload: {
          action: type,
          data
        },
        timestamp: Date.now(),
        priority: 'high'
      });
    } catch (error) {
      console.error('[AgentLifecycleManager] Failed to emit system event:', error);
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Shutdown lifecycle manager
   */
  async shutdown(): Promise<void> {
    console.log('[AgentLifecycleManager] Shutting down...');
    
    await this.stopAllAgents();
    this.agents.clear();
    
    console.log('[AgentLifecycleManager] Shutdown complete');
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const agentLifecycleManager = AgentLifecycleManager.getInstance();
export default agentLifecycleManager;