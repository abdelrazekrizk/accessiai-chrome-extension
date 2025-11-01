/**
 * AccessiAI Message Bus - Inter-Agent Communication System
 * High-performance message routing with priority queuing and error handling
 * Provides reliable inter-agent communication with performance monitoring
 * Target: <10ms response time, >1000 messages/second throughput
 */

import type {
  AgentMessage,
  MessagePriority,
  AgentError,
  PerformanceMetrics
} from '../types/index';

// ============================================================================
// MESSAGE BUS INTERFACES
// ============================================================================

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

// ============================================================================
// PRIORITY QUEUE IMPLEMENTATION
// ============================================================================

class PriorityQueue<T> {
  private queues: Map<MessagePriority, T[]> = new Map([
    ['critical', []],
    ['high', []],
    ['normal', []],
    ['low', []]
  ]);

  private readonly priorityOrder: MessagePriority[] = ['critical', 'high', 'normal', 'low'];

  enqueue(item: T, priority: MessagePriority): void {
    const queue = this.queues.get(priority);
    if (queue) {
      queue.push(item);
    } else {
      throw new Error(`Invalid priority level: ${priority}`);
    }
  }

  dequeue(): T | undefined {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue.shift();
      }
    }
    return undefined;
  }

  peek(): T | undefined {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue[0];
      }
    }
    return undefined;
  }

  size(): number {
    return Array.from(this.queues.values()).reduce((total, queue) => total + queue.length, 0);
  }

  clear(): void {
    this.queues.forEach(queue => queue.length = 0);
  }

  getQueueSizes(): Record<MessagePriority, number> {
    return {
      critical: this.queues.get('critical')?.length || 0,
      high: this.queues.get('high')?.length || 0,
      normal: this.queues.get('normal')?.length || 0,
      low: this.queues.get('low')?.length || 0
    };
  }
}

// ============================================================================
// MESSAGE BUS IMPLEMENTATION
// ============================================================================

export class MessageBus {
  // ============================================================================
  // CORE PROPERTIES
  // ============================================================================

  private subscribers: Map<string, MessageHandler[]> = new Map();
  private messageQueue: PriorityQueue<QueuedMessage> = new PriorityQueue();
  private routingRules: RoutingRule[] = [];
  private processing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private config: MessageBusConfig = {
    maxQueueSize: 10000,
    defaultTTL: 30000,        // 30 seconds
    processingInterval: 10,    // 10ms for optimal performance
    retryAttempts: 3,
    retryDelay: 1000          // 1 second base delay
  };

  // ============================================================================
  // PERFORMANCE METRICS
  // ============================================================================

  private metrics: PerformanceMetrics = {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    resourceUsage: 0,
    uptime: 0,
    lastUpdated: Date.now()
  };

  private messageCount: number = 0;
  private errorCount: number = 0;
  private startTime: number = Date.now();

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  private static instance: MessageBus | null = null;

  static getInstance(): MessageBus {
    if (!MessageBus.instance) {
      MessageBus.instance = new MessageBus();
    }
    return MessageBus.instance;
  }

  private constructor() {
    this.startProcessing();
    console.log('[MessageBus] Initialized with high-performance message routing');
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Publish a message to a topic
   */
  async publish(topic: string, message: AgentMessage): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Validate message
      if (!this.validateMessage(message)) {
        throw new Error('Invalid message format');
      }

      // Check queue capacity
      if (this.messageQueue.size() >= this.config.maxQueueSize) {
        throw new Error('Message queue at capacity');
      }

      // Enqueue message for processing
      const queuedMessage: QueuedMessage = {
        message: { 
          ...message, 
          payload: { 
            ...message.payload, 
            metadata: { 
              ...message.payload.metadata, 
              topic 
            } 
          } 
        },
        enqueuedAt: Date.now(),
        attempts: 0,
        lastAttempt: 0
      };

      this.messageQueue.enqueue(queuedMessage, message.priority);
      
      // Update metrics
      const processingTime = performance.now() - startTime;
      this.updateMetrics(processingTime, true);
      
      console.log(`[MessageBus] Published message to topic: ${topic}, priority: ${message.priority}`);
      
    } catch (error) {
      const processingTime = performance.now() - startTime;
      this.updateMetrics(processingTime, false);
      this.handleError('PUBLISH_FAILED', `Failed to publish message to topic: ${topic}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a topic
   */
  async subscribe(topic: string, handler: MessageHandler): Promise<string> {
    try {
      if (!this.subscribers.has(topic)) {
        this.subscribers.set(topic, []);
      }
      
      const handlers = this.subscribers.get(topic)!;
      handlers.push(handler);
      
      // Generate subscription ID
      const subscriptionId = `${topic}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[MessageBus] Subscribed to topic: ${topic}, subscription ID: ${subscriptionId}`);
      return subscriptionId;
      
    } catch (error) {
      this.handleError('SUBSCRIBE_FAILED', `Failed to subscribe to topic: ${topic}`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    try {
      // Parse subscription ID to get topic
      const parts = subscriptionId.split('-');
      if (parts.length === 0 || !parts[0]) {
        throw new Error('Invalid subscription ID format');
      }
      
      const topic = parts[0];
      const handlers = this.subscribers.get(topic);
      
      if (handlers && handlers.length > 0) {
        // For simplicity, remove the last handler (in production, we'd track handlers by ID)
        handlers.pop();
        
        if (handlers.length === 0) {
          this.subscribers.delete(topic);
        }
      }
      
      console.log(`[MessageBus] Unsubscribed: ${subscriptionId}`);
      
    } catch (error) {
      this.handleError('UNSUBSCRIBE_FAILED', `Failed to unsubscribe: ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Route message directly to target agent(s)
   */
  async route(message: AgentMessage): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Apply routing rules
      const targets = this.applyRoutingRules(message);
      
      if (targets.length === 0) {
        if (message.target === 'broadcast') {
          targets.push('broadcast');
        } else {
          targets.push(message.target);
        }
      }

      // Route to each target
      for (const target of targets) {
        if (target === 'broadcast') {
          await this.broadcastMessage(message);
        } else {
          await this.unicastMessage(message, target);
        }
      }
      
      // Update metrics
      const processingTime = performance.now() - startTime;
      this.updateMetrics(processingTime, true);
      
    } catch (error) {
      const processingTime = performance.now() - startTime;
      this.updateMetrics(processingTime, false);
      this.handleError('ROUTE_FAILED', `Failed to route message from ${message.source} to ${message.target}`, error);
      throw error;
    }
  }

  /**
   * Add routing rule
   */
  addRoutingRule(rule: RoutingRule): void {
    this.routingRules.push(rule);
    console.log(`[MessageBus] Added routing rule: ${rule.pattern} -> ${rule.target}`);
  }

  /**
   * Remove routing rule
   */
  removeRoutingRule(pattern: string | RegExp): void {
    const patternStr = pattern.toString();
    this.routingRules = this.routingRules.filter(rule => rule.pattern.toString() !== patternStr);
    console.log(`[MessageBus] Removed routing rule: ${pattern}`);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    size: number;
    queueSizes: Record<MessagePriority, number>;
    processing: boolean;
  } {
    return {
      size: this.messageQueue.size(),
      queueSizes: this.messageQueue.getQueueSizes(),
      processing: this.processing
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Start message processing loop
   */
  private startProcessing(): void {
    if (this.processingInterval) {
      return; // Already processing
    }

    this.processingInterval = setInterval(async () => {
      await this.processMessageQueue();
    }, this.config.processingInterval);

    this.processing = true;
    console.log('[MessageBus] Started message processing');
  }

  /**
   * Stop message processing
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.processing = false;
    console.log('[MessageBus] Stopped message processing');
  }

  /**
   * Process message queue
   */
  private async processMessageQueue(): Promise<void> {
    const batchSize = 10; // Process up to 10 messages per cycle
    let processed = 0;

    while (processed < batchSize && this.messageQueue.size() > 0) {
      const queuedMessage = this.messageQueue.dequeue();
      if (!queuedMessage) break;

      try {
        // Check TTL
        const age = Date.now() - queuedMessage.enqueuedAt;
        const ttl = queuedMessage.message.ttl || this.config.defaultTTL;
        
        if (age > ttl) {
          console.warn(`[MessageBus] Message expired: ${queuedMessage.message.id}`);
          continue;
        }

        // Process message
        await this.deliverMessage(queuedMessage);
        processed++;
        
      } catch (error) {
        await this.handleDeliveryFailure(queuedMessage, error as Error);
      }
    }
  }

  /**
   * Deliver message to subscribers
   */
  private async deliverMessage(queuedMessage: QueuedMessage): Promise<void> {
    const { message } = queuedMessage;
    const topic = message.payload.metadata?.['topic'] as string | undefined;
    
    if (topic) {
      // Topic-based delivery
      const handlers = this.subscribers.get(topic) || [];
      
      await Promise.all(
        handlers.map(async (handler) => {
          try {
            await handler(message);
          } catch (error) {
            console.error(`[MessageBus] Handler error for topic ${topic}:`, error);
          }
        })
      );
    } else {
      // Direct routing
      await this.route(message);
    }
  }

  /**
   * Handle delivery failure with retry logic
   */
  private async handleDeliveryFailure(queuedMessage: QueuedMessage, error: Error): Promise<void> {
    const updatedMessage: QueuedMessage = {
      ...queuedMessage,
      attempts: queuedMessage.attempts + 1,
      lastAttempt: Date.now()
    };

    if (updatedMessage.attempts < this.config.retryAttempts) {
      // Retry with exponential backoff
      const delay = this.config.retryDelay * Math.pow(2, updatedMessage.attempts - 1);
      
      setTimeout(() => {
        this.messageQueue.enqueue(updatedMessage, queuedMessage.message.priority);
      }, delay);
      
      console.warn(`[MessageBus] Retrying message delivery (attempt ${updatedMessage.attempts}): ${queuedMessage.message.id}`);
    } else {
      // Max retries exceeded
      this.handleError('DELIVERY_FAILED', `Failed to deliver message after ${this.config.retryAttempts} attempts`, error);
      console.error(`[MessageBus] Message delivery failed permanently: ${queuedMessage.message.id}`);
    }
  }

  /**
   * Broadcast message to all subscribers
   */
  private async broadcastMessage(message: AgentMessage): Promise<void> {
    const allHandlers: MessageHandler[] = [];
    
    // Collect all handlers from all topics
    for (const handlers of this.subscribers.values()) {
      allHandlers.push(...handlers);
    }

    // Deliver to all handlers
    await Promise.all(
      allHandlers.map(async (handler) => {
        try {
          await handler(message);
        } catch (error) {
          console.error('[MessageBus] Broadcast handler error:', error);
        }
      })
    );
  }

  /**
   * Send message to specific target
   */
  private async unicastMessage(message: AgentMessage, target: string): Promise<void> {
    const handlers = this.subscribers.get(target) || [];
    
    if (handlers.length === 0) {
      console.warn(`[MessageBus] No handlers found for target: ${target}`);
      return;
    }

    // Deliver to target handlers
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(message);
        } catch (error) {
          console.error(`[MessageBus] Unicast handler error for ${target}:`, error);
        }
      })
    );
  }

  /**
   * Apply routing rules to determine message targets
   */
  private applyRoutingRules(message: AgentMessage): string[] {
    const targets: string[] = [];
    
    for (const rule of this.routingRules) {
      if (!rule.enabled) continue;
      
      let matches = false;
      
      if (typeof rule.pattern === 'string') {
        matches = message.type === rule.pattern || message.source === rule.pattern;
      } else {
        matches = rule.pattern.test(message.type) || rule.pattern.test(message.source);
      }
      
      if (matches) {
        if (Array.isArray(rule.target)) {
          targets.push(...rule.target);
        } else {
          targets.push(rule.target);
        }
      }
    }
    
    return [...new Set(targets)]; // Remove duplicates
  }

  /**
   * Validate message format
   */
  private validateMessage(message: AgentMessage): boolean {
    return !!(
      message.id &&
      message.type &&
      message.source &&
      message.target &&
      message.payload &&
      typeof message.timestamp === 'number' &&
      message.priority &&
      ['critical', 'high', 'normal', 'low'].includes(message.priority)
    );
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(processingTime: number, success: boolean): void {
    this.messageCount++;
    
    if (!success) {
      this.errorCount++;
    }
    
    // Update response time (moving average)
    this.metrics.responseTime = this.metrics.responseTime * 0.9 + processingTime * 0.1;
    
    // Update throughput (messages per second)
    const uptime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = this.messageCount / Math.max(uptime, 1);
    
    // Update error rate
    this.metrics.errorRate = this.errorCount / Math.max(this.messageCount, 1);
    
    // Update resource usage (queue size as percentage of max)
    this.metrics.resourceUsage = (this.messageQueue.size() / this.config.maxQueueSize) * 100;
    
    // Update uptime
    this.metrics.uptime = uptime * 1000; // Convert to milliseconds
    this.metrics.lastUpdated = Date.now();
  }

  /**
   * Handle errors with proper logging
   */
  private handleError(code: string, message: string, originalError?: unknown): void {
    const error: AgentError = {
      code,
      message,
      details: originalError,
      timestamp: Date.now()
    };
    
    console.error(`[MessageBus] ${code}: ${message}`, originalError);
    
    // Emit error event to subscribers
    const errorMessage: AgentMessage = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'error',
      source: 'message-bus',
      target: 'broadcast',
      payload: {
        action: 'error-occurred',
        data: error
      },
      timestamp: Date.now(),
      priority: 'high'
    };
    
    // Don't use publish to avoid infinite error loops
    this.messageQueue.enqueue({
      message: errorMessage,
      enqueuedAt: Date.now(),
      attempts: 0,
      lastAttempt: 0
    }, 'high');
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Shutdown message bus and cleanup resources
   */
  shutdown(): void {
    this.stopProcessing();
    this.messageQueue.clear();
    this.subscribers.clear();
    this.routingRules = [];
    
    console.log('[MessageBus] Shutdown complete');
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const messageBus = MessageBus.getInstance();
export default messageBus;