/**
 * AccessiAI Agent Lifecycle Manager
 * Manages agent initialization, health monitoring, and automatic recovery
 * Provides comprehensive agent lifecycle management with failure recovery
 * Optimized for fast health checks and automatic failure recovery
 */
import type { AgentStatus, SystemHealthReport } from '../types/index';
import { BaseAgent } from '../agents/BaseAgent';
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
export declare class AgentLifecycleManager {
    private agents;
    private healthCheckInterval;
    private isShuttingDown;
    private startupPromises;
    private config;
    private metrics;
    private static instance;
    static getInstance(): AgentLifecycleManager;
    private constructor();
    /**
     * Register an agent for lifecycle management
     */
    registerAgent(config: AgentConfig, agentFactory: () => BaseAgent): Promise<void>;
    /**
     * Unregister an agent from lifecycle management
     */
    unregisterAgent(agentId: string): Promise<void>;
    /**
     * Start a specific agent
     */
    startAgent(agentId: string): Promise<void>;
    /**
     * Stop a specific agent
     */
    stopAgent(agentId: string): Promise<void>;
    /**
     * Start all registered agents
     */
    startAllAgents(): Promise<void>;
    /**
     * Stop all agents
     */
    stopAllAgents(): Promise<void>;
    /**
     * Start health monitoring for all agents
     */
    private startHealthMonitoring;
    /**
     * Stop health monitoring
     */
    private stopHealthMonitoring;
    /**
     * Perform health checks on all active agents
     */
    private performHealthChecks;
    /**
     * Check health of a specific agent
     */
    private checkAgentHealth;
    /**
     * Handle agent failure and attempt recovery
     */
    private handleAgentFailure;
    /**
     * Restart a failed agent
     */
    private restartAgent;
    /**
     * Get comprehensive system health report
     */
    getSystemHealth(): SystemHealthReport;
    /**
     * Get agent registry information
     */
    getAgentRegistry(): Map<string, AgentInstance>;
    /**
     * Get lifecycle metrics
     */
    getMetrics(): {
        totalAgents: number;
        activeAgents: number;
        failedAgents: number;
        restartCount: number;
        lastHealthCheckTime: number;
        averageHealthCheckTime: number;
    };
    /**
     * Perform actual agent startup
     */
    private performAgentStartup;
    /**
     * Subscribe to agent events
     */
    private subscribeToAgentEvents;
    /**
     * Update agent status
     */
    private updateAgentStatus;
    /**
     * Update agent instance data
     */
    private updateAgentInstance;
    /**
     * Calculate overall system status
     */
    private calculateSystemStatus;
    /**
     * Calculate total memory usage
     */
    private calculateTotalMemoryUsage;
    /**
     * Calculate total CPU usage
     */
    private calculateTotalCpuUsage;
    /**
     * Emit system event
     */
    private emitSystemEvent;
    /**
     * Shutdown lifecycle manager
     */
    shutdown(): Promise<void>;
}
export declare const agentLifecycleManager: AgentLifecycleManager;
export default agentLifecycleManager;
//# sourceMappingURL=AgentLifecycleManager.d.ts.map