/**
 * AccessiAI Performance Monitor - System Metrics Collection
 * Task 8: Performance Monitoring Core Implementation
 *
 * Response time tracking, throughput monitoring, and system health aggregation
 * Following AccessiAI_Clean_Implementation_Roadmap.md specifications
 */
import type { PerformanceMetrics, SystemHealthReport, ResourceUsage } from '@/types';
export interface PerformanceMonitorConfig {
    readonly metricsCollectionInterval: number;
    readonly healthCheckInterval: number;
    readonly alertThresholds: AlertThresholds;
    readonly retentionPeriod: number;
    readonly enableDetailedMetrics: boolean;
}
export interface AlertThresholds {
    readonly responseTime: number;
    readonly errorRate: number;
    readonly memoryUsage: number;
    readonly cpuUsage: number;
    readonly throughputMin: number;
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
export type AlertType = 'response-time' | 'error-rate' | 'memory-usage' | 'cpu-usage' | 'throughput-low' | 'agent-offline' | 'system-degraded';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export declare class PerformanceMonitor {
    private agentMetrics;
    private metricHistory;
    private systemAlerts;
    private isMonitoring;
    private metricsInterval;
    private healthCheckInterval;
    private config;
    private readonly PERFORMANCE_TARGETS;
    private static instance;
    static getInstance(): PerformanceMonitor;
    private constructor();
    initialize(): Promise<void>;
    recordMetric(agentId: string, metrics: PerformanceMetrics): Promise<void>;
    getAgentMetrics(agentId: string): Promise<PerformanceMetrics | null>;
    getAllAgentMetrics(): Promise<Map<string, PerformanceMetrics>>;
    getSystemHealth(): Promise<SystemHealthReport>;
    startTimer(operationId: string): PerformanceTimer;
    recordThroughput(agentId: string, operationCount: number, timeWindow: number): Promise<void>;
    private getAgentHealthInfo;
    private calculateSystemPerformance;
    private getSystemResources;
    private calculateOverallStatus;
    private checkAlertThresholds;
    private createAlert;
    private getSeverity;
    private startMonitoring;
    private stopMonitoring;
    private collectSystemMetrics;
    private performHealthCheck;
    private addToHistory;
    private getDefaultMetrics;
    private estimateCPUUsage;
    private calculateStorageUsage;
    private getRecentErrors;
    private getMessageBusStatus;
    getAlerts(severity?: AlertSeverity): Promise<PerformanceAlert[]>;
    clearAlerts(): Promise<void>;
    getMetricHistory(agentId: string, timeRange?: number): Promise<MetricSnapshot[]>;
    updateConfig(newConfig: Partial<PerformanceMonitorConfig>): Promise<void>;
    shutdown(): Promise<void>;
}
export interface PerformanceTimer {
    readonly operationId: string;
    readonly startTime: number;
    end(agentId: string): Promise<number>;
}
export declare const performanceMonitor: PerformanceMonitor;
export default performanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map