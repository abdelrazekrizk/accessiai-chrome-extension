/**
 * AccessiAI Message Bus - Inter-Agent Communication System
 * High-performance message routing with priority queuing and error handling
 * Provides reliable inter-agent communication with performance monitoring
 * Target: <10ms response time, >1000 messages/second throughput
 */
import type { AgentMessage, MessagePriority, PerformanceMetrics } from '../types/index';
export interface MessageHandler {
    (message: AgentMessage): Promise<void> | void;
}
export interface RoutingRule {
    readonly pattern: string | RegExp;
    readonly target: string | string[];
    readonly priority: MessagePriority;
    readonly enabled: boolean;
}
export interface MessageBusConfig {
    readonly maxQueueSize: number;
    readonly defaultTTL: number;
    readonly processingInterval: number;
    readonly retryAttempts: number;
    readonly retryDelay: number;
}
export interface QueuedMessage {
    readonly message: AgentMessage;
    readonly enqueuedAt: number;
    readonly attempts: number;
    readonly lastAttempt: number;
}
export declare class MessageBus {
    private subscribers;
    private messageQueue;
    private routingRules;
    private processing;
    private processingInterval;
    private config;
    private metrics;
    private messageCount;
    private errorCount;
    private startTime;
    private static instance;
    static getInstance(): MessageBus;
    private constructor();
    /**
     * Publish a message to a topic
     */
    publish(topic: string, message: AgentMessage): Promise<void>;
    /**
     * Subscribe to a topic
     */
    subscribe(topic: string, handler: MessageHandler): Promise<string>;
    /**
     * Unsubscribe from a topic
     */
    unsubscribe(subscriptionId: string): Promise<void>;
    /**
     * Route message directly to target agent(s)
     */
    route(message: AgentMessage): Promise<void>;
    /**
     * Add routing rule
     */
    addRoutingRule(rule: RoutingRule): void;
    /**
     * Remove routing rule
     */
    removeRoutingRule(pattern: string | RegExp): void;
    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get queue status
     */
    getQueueStatus(): {
        size: number;
        queueSizes: Record<MessagePriority, number>;
        processing: boolean;
    };
    /**
     * Start message processing loop
     */
    private startProcessing;
    /**
     * Stop message processing
     */
    private stopProcessing;
    /**
     * Process message queue
     */
    private processMessageQueue;
    /**
     * Deliver message to subscribers
     */
    private deliverMessage;
    /**
     * Handle delivery failure with retry logic
     */
    private handleDeliveryFailure;
    /**
     * Broadcast message to all subscribers
     */
    private broadcastMessage;
    /**
     * Send message to specific target
     */
    private unicastMessage;
    /**
     * Apply routing rules to determine message targets
     */
    private applyRoutingRules;
    /**
     * Validate message format
     */
    private validateMessage;
    /**
     * Update performance metrics
     */
    private updateMetrics;
    /**
     * Handle errors with proper logging
     */
    private handleError;
    /**
     * Shutdown message bus and cleanup resources
     */
    shutdown(): void;
}
export declare const messageBus: MessageBus;
export default messageBus;
//# sourceMappingURL=MessageBus.d.ts.map