/**
 * AccessiAI Performance Monitor - System Metrics Collection
 * Task 8: Performance Monitoring Core Implementation
 * 
 * Response time tracking, throughput monitoring, and system health aggregation
 * Following AccessiAI_Clean_Implementation_Roadmap.md specifications
 */

import type {
  PerformanceMetrics,
  SystemHealthReport,
  SystemPerformance,
  ResourceUsage,
  AgentHealthInfo,
  SystemStatus,
  SystemError,
  MessageBusStatus
} from '@/types';

// ============================================================================
// PERFORMANCE MONITOR INTERFACES (Following Roadmap)
// ============================================================================

export interface PerformanceMonitorConfig {
  readonly metricsCollectionInterval: number;  // milliseconds
  readonly healthCheckInterval: number;        // milliseconds
  readonly alertThresholds: AlertThresholds;
  readonly retentionPeriod: number;           // milliseconds
  readonly enableDetailedMetrics: boolean;
}

export interface AlertThresholds {
  readonly responseTime: number;              // milliseconds
  readonly errorRate: number;                 // percentage (0-1)
  readonly memoryUsage: number;               // MB
  readonly cpuUsage: number;                  // percentage (0-100)
  readonly throughputMin: number;             // operations/second
}

export interface MetricSnapshot {
  readonly timestamp: number;
  readonly agentId: string;
  readonly metrics: PerformanceMetrics;
  readonly systemResources: ResourceUsage;
}

export interface PerformanceAlert {
  readonly id: string;
  readonly type: AlertType;
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly agentId?: string;
  readonly threshold: number;
  readonly actualValue: number;
  readonly timestamp: number;
}

export type AlertType = 
  | 'response-time' 
  | 'error-rate' 
  | 'memory-usage' 
  | 'cpu-usage' 
  | 'throughput-low'
  | 'agent-offline'
  | 'system-degraded';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// PERFORMANCE MONITOR IMPLEMENTATION (Following Roadmap Blueprint)
// ============================================================================

export class PerformanceMonitor {
  // ============================================================================
  // CORE PROPERTIES (Following Roadmap Variable Naming)
  // ============================================================================

  private agentMetrics: Map<string, PerformanceMetrics> = new Map();
  private metricHistory: Map<string, MetricSnapshot[]> = new Map();
  private systemAlerts: PerformanceAlert[] = [];
  private isMonitoring: boolean = false;
  private metricsInterval: number | null = null;
  private healthCheckInterval: number | null = null;

  // ============================================================================
  // CONFIGURATION (Following Roadmap Specifications)
  // ============================================================================

  private config: PerformanceMonitorConfig = {
    metricsCollectionInterval: 1000,    // 1 second
    healthCheckInterval: 5000,          // 5 seconds
    alertThresholds: {
      responseTime: 10,                 // 10ms for coordination agent
      errorRate: 0.01,                  // 1% error rate
      memoryUsage: 75,                  // 75MB memory limit
      cpuUsage: 7,                      // 7% CPU usage
      throughputMin: 100                // 100 ops/second minimum
    },
    retentionPeriod: 3600000,          // 1 hour
    enableDetailedMetrics: true
  };

  // Performance targets from roadmap
  private readonly PERFORMANCE_TARGETS = {
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

  // ============================================================================
  // SINGLETON PATTERN (Following Roadmap Architecture)
  // ============================================================================

  private static instance: PerformanceMonitor | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    console.log('[PerformanceMonitor] Initialized with <10ms response time target');
  }

  // ============================================================================
  // INITIALIZATION (Following Roadmap Methods)
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      console.log('[PerformanceMonitor] Initializing performance monitoring system...');

      // Clear any existing intervals
      this.stopMonitoring();

      // Initialize metric collections
      this.agentMetrics.clear();
      this.metricHistory.clear();
      this.systemAlerts = [];

      // Start monitoring intervals
      this.startMonitoring();

      console.log('[PerformanceMonitor] Performance monitoring system initialized successfully');

    } catch (error) {
      console.error('[PerformanceMonitor] Failed to initialize performance monitoring:', error);
      throw error;
    }
  }

  // ============================================================================
  // CORE MONITORING OPERATIONS (Following Roadmap Methods)
  // ============================================================================

  async recordMetric(agentId: string, metrics: PerformanceMetrics): Promise<void> {
    try {
      const timestamp = Date.now();

      // Update current metrics
      this.agentMetrics.set(agentId, {
        ...metrics,
        lastUpdated: timestamp
      });

      // Add to history if detailed metrics enabled
      if (this.config.enableDetailedMetrics) {
        const snapshot: MetricSnapshot = {
          timestamp,
          agentId,
          metrics,
          systemResources: await this.getSystemResources()
        };

        this.addToHistory(agentId, snapshot);
      }

      // Check for alerts
      await this.checkAlertThresholds(agentId, metrics);

      console.log(`[PerformanceMonitor] Recorded metrics for agent: ${agentId}`);

    } catch (error) {
      console.error(`[PerformanceMonitor] Failed to record metrics for ${agentId}:`, error);
      throw error;
    }
  }

  async getAgentMetrics(agentId: string): Promise<PerformanceMetrics | null> {
    return this.agentMetrics.get(agentId) || null;
  }

  async getAllAgentMetrics(): Promise<Map<string, PerformanceMetrics>> {
    return new Map(this.agentMetrics);
  }

  async getSystemHealth(): Promise<SystemHealthReport> {
    try {
      const timestamp = Date.now();
      const agents = await this.getAgentHealthInfo();
      const systemPerformance = await this.calculateSystemPerformance();
      const resources = await this.getSystemResources();
      const overallStatus = this.calculateOverallStatus(agents, systemPerformance, resources);

      const messageBusStatus = await this.getMessageBusStatus();
      const healthReport: SystemHealthReport = {
        timestamp,
        overallStatus,
        agents,
        performance: systemPerformance,
        resources,
        errors: this.getRecentErrors(),
        ...(messageBusStatus && { messageBus: messageBusStatus })
      };

      console.log(`[PerformanceMonitor] Generated system health report - Status: ${overallStatus}`);
      return healthReport;

    } catch (error) {
      console.error('[PerformanceMonitor] Failed to generate system health report:', error);
      throw error;
    }
  }

  // ============================================================================
  // RESPONSE TIME TRACKING (Following Roadmap <10ms Target)
  // ============================================================================

  startTimer(operationId: string): PerformanceTimer {
    const startTime = performance.now();
    
    return {
      operationId,
      startTime,
      end: async (agentId: string) => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Record response time metric
        const currentMetrics = this.agentMetrics.get(agentId) || this.getDefaultMetrics();
        const updatedMetrics: PerformanceMetrics = {
          ...currentMetrics,
          responseTime: duration,
          lastUpdated: Date.now()
        };

        await this.recordMetric(agentId, updatedMetrics);

        // Check if within target (<10ms for coordination agent)
        if (agentId === 'coordination-agent' && duration > this.PERFORMANCE_TARGETS.COORDINATION_AGENT.RESPONSE_TIME) {
          await this.createAlert({
            type: 'response-time',
            severity: 'high',
            message: `Coordination agent response time exceeded target: ${duration.toFixed(2)}ms`,
            agentId,
            threshold: this.PERFORMANCE_TARGETS.COORDINATION_AGENT.RESPONSE_TIME,
            actualValue: duration
          });
        }

        return duration;
      }
    };
  }

  // ============================================================================
  // THROUGHPUT MONITORING (Following Roadmap >1000 messages/second)
  // ============================================================================

  async recordThroughput(agentId: string, operationCount: number, timeWindow: number): Promise<void> {
    try {
      const throughput = (operationCount / timeWindow) * 1000; // operations per second

      const currentMetrics = this.agentMetrics.get(agentId) || this.getDefaultMetrics();
      const updatedMetrics: PerformanceMetrics = {
        ...currentMetrics,
        throughput,
        lastUpdated: Date.now()
      };

      await this.recordMetric(agentId, updatedMetrics);

      // Check throughput targets
      if (agentId === 'coordination-agent' && throughput < this.PERFORMANCE_TARGETS.COORDINATION_AGENT.THROUGHPUT) {
        await this.createAlert({
          type: 'throughput-low',
          severity: 'medium',
          message: `Coordination agent throughput below target: ${throughput.toFixed(2)} ops/sec`,
          agentId,
          threshold: this.PERFORMANCE_TARGETS.COORDINATION_AGENT.THROUGHPUT,
          actualValue: throughput
        });
      }

    } catch (error) {
      console.error(`[PerformanceMonitor] Failed to record throughput for ${agentId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // SYSTEM HEALTH AGGREGATION (Following Roadmap Methods)
  // ============================================================================

  private async getAgentHealthInfo(): Promise<AgentHealthInfo[]> {
    const healthInfo: AgentHealthInfo[] = [];

    for (const [agentId, metrics] of this.agentMetrics.entries()) {
      const lastHeartbeat = metrics.lastUpdated;
      const isOnline = Date.now() - lastHeartbeat < 30000; // 30 seconds timeout

      healthInfo.push({
        agentId,
        status: isOnline ? 'active' : 'offline',
        lastHeartbeat,
        responseTime: metrics.responseTime,
        errorCount: Math.floor(metrics.errorRate * 100), // Convert to count
        memoryUsage: metrics.resourceUsage
      });
    }

    return healthInfo;
  }

  private async calculateSystemPerformance(): Promise<SystemPerformance> {
    const allMetrics = Array.from(this.agentMetrics.values());
    
    if (allMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        totalThroughput: 0,
        systemErrorRate: 0,
        uptime: 0
      };
    }

    const averageResponseTime = allMetrics.reduce((sum, m) => sum + m.responseTime, 0) / allMetrics.length;
    const totalThroughput = allMetrics.reduce((sum, m) => sum + m.throughput, 0);
    const systemErrorRate = allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length;
    const uptime = Math.min(...allMetrics.map(m => m.uptime));

    return {
      averageResponseTime,
      totalThroughput,
      systemErrorRate,
      uptime
    };
  }

  private async getSystemResources(): Promise<ResourceUsage> {
    try {
      // Use Performance API and Memory API where available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0; // MB

      // Estimate CPU usage based on performance timing
      const cpuUsage = this.estimateCPUUsage();

      return {
        memoryUsage,
        cpuUsage,
        storageUsage: await this.calculateStorageUsage(),
        networkUsage: 0 // Local processing only
      };

    } catch (error) {
      console.error('[PerformanceMonitor] Failed to get system resources:', error);
      return {
        memoryUsage: 0,
        cpuUsage: 0,
        storageUsage: 0,
        networkUsage: 0
      };
    }
  }

  private calculateOverallStatus(
    agents: AgentHealthInfo[], 
    performance: SystemPerformance, 
    resources: ResourceUsage
  ): SystemStatus {
    // Check for critical issues
    if (agents.some(a => a.status === 'offline')) {
      return 'critical';
    }

    if (resources.memoryUsage > this.PERFORMANCE_TARGETS.SYSTEM_OVERALL.MEMORY_USAGE ||
        resources.cpuUsage > this.PERFORMANCE_TARGETS.SYSTEM_OVERALL.CPU_USAGE * 100 ||
        performance.averageResponseTime > this.PERFORMANCE_TARGETS.SYSTEM_OVERALL.RESPONSE_TIME) {
      return 'degraded';
    }

    if (performance.systemErrorRate > 0.05) { // 5% error rate
      return 'degraded';
    }

    return 'healthy';
  }

  // ============================================================================
  // ALERT SYSTEM (Following Roadmap Alerting Mechanisms)
  // ============================================================================

  private async checkAlertThresholds(agentId: string, metrics: PerformanceMetrics): Promise<void> {
    const thresholds = this.config.alertThresholds;

    // Response time alert
    if (metrics.responseTime > thresholds.responseTime) {
      await this.createAlert({
        type: 'response-time',
        severity: this.getSeverity(metrics.responseTime, thresholds.responseTime),
        message: `Agent ${agentId} response time exceeded threshold`,
        agentId,
        threshold: thresholds.responseTime,
        actualValue: metrics.responseTime
      });
    }

    // Error rate alert
    if (metrics.errorRate > thresholds.errorRate) {
      await this.createAlert({
        type: 'error-rate',
        severity: this.getSeverity(metrics.errorRate, thresholds.errorRate),
        message: `Agent ${agentId} error rate exceeded threshold`,
        agentId,
        threshold: thresholds.errorRate,
        actualValue: metrics.errorRate
      });
    }

    // Resource usage alert
    if (metrics.resourceUsage > thresholds.memoryUsage) {
      await this.createAlert({
        type: 'memory-usage',
        severity: this.getSeverity(metrics.resourceUsage, thresholds.memoryUsage),
        message: `Agent ${agentId} memory usage exceeded threshold`,
        agentId,
        threshold: thresholds.memoryUsage,
        actualValue: metrics.resourceUsage
      });
    }
  }

  private async createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>): Promise<void> {
    const alert: PerformanceAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.systemAlerts.push(alert);

    // Keep only recent alerts (last hour)
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.systemAlerts = this.systemAlerts.filter(a => a.timestamp > cutoff);

    console.warn(`[PerformanceMonitor] Alert created: ${alert.message}`);
  }

  private getSeverity(actualValue: number, threshold: number): AlertSeverity {
    const ratio = actualValue / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  // ============================================================================
  // MONITORING LIFECYCLE (Following Roadmap Implementation)
  // ============================================================================

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    // Start metrics collection interval
    this.metricsInterval = window.setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.metricsCollectionInterval);

    // Start health check interval
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    this.isMonitoring = true;
    console.log('[PerformanceMonitor] Monitoring started');
  }

  private stopMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.isMonitoring = false;
    console.log('[PerformanceMonitor] Monitoring stopped');
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Collect system-wide metrics
      const resources = await this.getSystemResources();
      
      // Check system-level thresholds
      if (resources.memoryUsage > this.config.alertThresholds.memoryUsage) {
        await this.createAlert({
          type: 'memory-usage',
          severity: 'high',
          message: `System memory usage exceeded threshold: ${resources.memoryUsage.toFixed(2)}MB`,
          threshold: this.config.alertThresholds.memoryUsage,
          actualValue: resources.memoryUsage
        });
      }

    } catch (error) {
      console.error('[PerformanceMonitor] Failed to collect system metrics:', error);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check agent heartbeats
      const now = Date.now();
      const staleThreshold = 30000; // 30 seconds

      for (const [agentId, metrics] of this.agentMetrics.entries()) {
        if (now - metrics.lastUpdated > staleThreshold) {
          await this.createAlert({
            type: 'agent-offline',
            severity: 'critical',
            message: `Agent ${agentId} appears to be offline`,
            agentId,
            threshold: staleThreshold,
            actualValue: now - metrics.lastUpdated
          });
        }
      }

    } catch (error) {
      console.error('[PerformanceMonitor] Failed to perform health check:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS (Following Roadmap Naming Conventions)
  // ============================================================================

  private addToHistory(agentId: string, snapshot: MetricSnapshot): void {
    if (!this.metricHistory.has(agentId)) {
      this.metricHistory.set(agentId, []);
    }

    const history = this.metricHistory.get(agentId)!;
    history.push(snapshot);

    // Keep only recent history
    const cutoff = Date.now() - this.config.retentionPeriod;
    const filteredHistory = history.filter(s => s.timestamp > cutoff);
    this.metricHistory.set(agentId, filteredHistory);
  }

  private getDefaultMetrics(): PerformanceMetrics {
    return {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      resourceUsage: 0,
      uptime: 0,
      lastUpdated: Date.now()
    };
  }

  private estimateCPUUsage(): number {
    // Simple CPU usage estimation based on performance timing
    // In a real implementation, this would use more sophisticated methods
    const now = performance.now();
    const usage = Math.min((now % 1000) / 10, 100); // Simplified estimation
    return usage;
  }

  private async calculateStorageUsage(): Promise<number> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return (estimate.usage || 0) / (1024 * 1024); // Convert to MB
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  private getRecentErrors(): SystemError[] {
    // Filter alerts to get recent errors
    const cutoff = Date.now() - 300000; // Last 5 minutes
    return this.systemAlerts
      .filter(alert => alert.timestamp > cutoff && alert.severity === 'critical')
      .map(alert => ({
        id: alert.id,
        type: 'system-error' as const,
        source: alert.agentId || 'system',
        message: alert.message,
        timestamp: alert.timestamp,
        severity: alert.severity,
        resolved: false
      }));
  }

  private async getMessageBusStatus(): Promise<MessageBusStatus | undefined> {
    // This would integrate with the MessageBus to get its status
    // For now, return undefined as MessageBus integration is separate
    return undefined;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async getAlerts(severity?: AlertSeverity): Promise<PerformanceAlert[]> {
    if (severity) {
      return this.systemAlerts.filter(alert => alert.severity === severity);
    }
    return [...this.systemAlerts];
  }

  async clearAlerts(): Promise<void> {
    this.systemAlerts = [];
    console.log('[PerformanceMonitor] All alerts cleared');
  }

  async getMetricHistory(agentId: string, timeRange?: number): Promise<MetricSnapshot[]> {
    const history = this.metricHistory.get(agentId) || [];
    
    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      return history.filter(snapshot => snapshot.timestamp > cutoff);
    }
    
    return [...history];
  }

  async updateConfig(newConfig: Partial<PerformanceMonitorConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new config
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
    
    console.log('[PerformanceMonitor] Configuration updated');
  }

  // ============================================================================
  // CLEANUP AND SHUTDOWN
  // ============================================================================

  async shutdown(): Promise<void> {
    try {
      console.log('[PerformanceMonitor] Shutting down performance monitoring...');

      // Stop monitoring intervals
      this.stopMonitoring();

      // Clear data
      this.agentMetrics.clear();
      this.metricHistory.clear();
      this.systemAlerts = [];

      console.log('[PerformanceMonitor] Performance monitoring shutdown complete');

    } catch (error) {
      console.error('[PerformanceMonitor] Error during performance monitoring shutdown:', error);
      throw error;
    }
  }
}

// ============================================================================
// PERFORMANCE TIMER INTERFACE
// ============================================================================

export interface PerformanceTimer {
  readonly operationId: string;
  readonly startTime: number;
  end(agentId: string): Promise<number>;
}

// ============================================================================
// EXPORT SINGLETON INSTANCE (Following Roadmap Pattern)
// ============================================================================

export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;