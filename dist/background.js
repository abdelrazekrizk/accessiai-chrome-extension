/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 776:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   messageBus: function() { return /* binding */ messageBus; }
/* harmony export */ });
/* unused harmony export MessageBus */
/**
 * AccessiAI Message Bus - Inter-Agent Communication System
 * High-performance message routing with priority queuing and error handling
 * Provides reliable inter-agent communication with performance monitoring
 * Target: <10ms response time, >1000 messages/second throughput
 */
// ============================================================================
// PRIORITY QUEUE IMPLEMENTATION
// ============================================================================
class PriorityQueue {
    queues = new Map([
        ['critical', []],
        ['high', []],
        ['normal', []],
        ['low', []]
    ]);
    priorityOrder = ['critical', 'high', 'normal', 'low'];
    enqueue(item, priority) {
        const queue = this.queues.get(priority);
        if (queue) {
            queue.push(item);
        }
        else {
            throw new Error(`Invalid priority level: ${priority}`);
        }
    }
    dequeue() {
        for (const priority of this.priorityOrder) {
            const queue = this.queues.get(priority);
            if (queue && queue.length > 0) {
                return queue.shift();
            }
        }
        return undefined;
    }
    peek() {
        for (const priority of this.priorityOrder) {
            const queue = this.queues.get(priority);
            if (queue && queue.length > 0) {
                return queue[0];
            }
        }
        return undefined;
    }
    size() {
        return Array.from(this.queues.values()).reduce((total, queue) => total + queue.length, 0);
    }
    clear() {
        this.queues.forEach(queue => queue.length = 0);
    }
    getQueueSizes() {
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
class MessageBus {
    // ============================================================================
    // CORE PROPERTIES
    // ============================================================================
    subscribers = new Map();
    messageQueue = new PriorityQueue();
    routingRules = [];
    processing = false;
    processingInterval = null;
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    config = {
        maxQueueSize: 10000,
        defaultTTL: 30000, // 30 seconds
        processingInterval: 10, // 10ms for optimal performance
        retryAttempts: 3,
        retryDelay: 1000 // 1 second base delay
    };
    // ============================================================================
    // PERFORMANCE METRICS
    // ============================================================================
    metrics = {
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        resourceUsage: 0,
        uptime: 0,
        lastUpdated: Date.now()
    };
    messageCount = 0;
    errorCount = 0;
    startTime = Date.now();
    // ============================================================================
    // SINGLETON PATTERN
    // ============================================================================
    static instance = null;
    static getInstance() {
        if (!MessageBus.instance) {
            MessageBus.instance = new MessageBus();
        }
        return MessageBus.instance;
    }
    constructor() {
        this.startProcessing();
        console.log('[MessageBus] Initialized with high-performance message routing');
    }
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    /**
     * Publish a message to a topic
     */
    async publish(topic, message) {
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
            const queuedMessage = {
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
        }
        catch (error) {
            const processingTime = performance.now() - startTime;
            this.updateMetrics(processingTime, false);
            this.handleError('PUBLISH_FAILED', `Failed to publish message to topic: ${topic}`, error);
            throw error;
        }
    }
    /**
     * Subscribe to a topic
     */
    async subscribe(topic, handler) {
        try {
            if (!this.subscribers.has(topic)) {
                this.subscribers.set(topic, []);
            }
            const handlers = this.subscribers.get(topic);
            handlers.push(handler);
            // Generate subscription ID
            const subscriptionId = `${topic}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log(`[MessageBus] Subscribed to topic: ${topic}, subscription ID: ${subscriptionId}`);
            return subscriptionId;
        }
        catch (error) {
            this.handleError('SUBSCRIBE_FAILED', `Failed to subscribe to topic: ${topic}`, error);
            throw error;
        }
    }
    /**
     * Unsubscribe from a topic
     */
    async unsubscribe(subscriptionId) {
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
        }
        catch (error) {
            this.handleError('UNSUBSCRIBE_FAILED', `Failed to unsubscribe: ${subscriptionId}`, error);
            throw error;
        }
    }
    /**
     * Route message directly to target agent(s)
     */
    async route(message) {
        const startTime = performance.now();
        try {
            // Apply routing rules
            const targets = this.applyRoutingRules(message);
            if (targets.length === 0) {
                if (message.target === 'broadcast') {
                    targets.push('broadcast');
                }
                else {
                    targets.push(message.target);
                }
            }
            // Route to each target
            for (const target of targets) {
                if (target === 'broadcast') {
                    await this.broadcastMessage(message);
                }
                else {
                    await this.unicastMessage(message, target);
                }
            }
            // Update metrics
            const processingTime = performance.now() - startTime;
            this.updateMetrics(processingTime, true);
        }
        catch (error) {
            const processingTime = performance.now() - startTime;
            this.updateMetrics(processingTime, false);
            this.handleError('ROUTE_FAILED', `Failed to route message from ${message.source} to ${message.target}`, error);
            throw error;
        }
    }
    /**
     * Add routing rule
     */
    addRoutingRule(rule) {
        this.routingRules.push(rule);
        console.log(`[MessageBus] Added routing rule: ${rule.pattern} -> ${rule.target}`);
    }
    /**
     * Remove routing rule
     */
    removeRoutingRule(pattern) {
        const patternStr = pattern.toString();
        this.routingRules = this.routingRules.filter(rule => rule.pattern.toString() !== patternStr);
        console.log(`[MessageBus] Removed routing rule: ${pattern}`);
    }
    /**
     * Get current performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get queue status
     */
    getQueueStatus() {
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
    startProcessing() {
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
    stopProcessing() {
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
    async processMessageQueue() {
        const batchSize = 10; // Process up to 10 messages per cycle
        let processed = 0;
        while (processed < batchSize && this.messageQueue.size() > 0) {
            const queuedMessage = this.messageQueue.dequeue();
            if (!queuedMessage)
                break;
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
            }
            catch (error) {
                await this.handleDeliveryFailure(queuedMessage, error);
            }
        }
    }
    /**
     * Deliver message to subscribers
     */
    async deliverMessage(queuedMessage) {
        const { message } = queuedMessage;
        const topic = message.payload.metadata?.['topic'];
        if (topic) {
            // Topic-based delivery
            const handlers = this.subscribers.get(topic) || [];
            await Promise.all(handlers.map(async (handler) => {
                try {
                    await handler(message);
                }
                catch (error) {
                    console.error(`[MessageBus] Handler error for topic ${topic}:`, error);
                }
            }));
        }
        else {
            // Direct routing
            await this.route(message);
        }
    }
    /**
     * Handle delivery failure with retry logic
     */
    async handleDeliveryFailure(queuedMessage, error) {
        const updatedMessage = {
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
        }
        else {
            // Max retries exceeded
            this.handleError('DELIVERY_FAILED', `Failed to deliver message after ${this.config.retryAttempts} attempts`, error);
            console.error(`[MessageBus] Message delivery failed permanently: ${queuedMessage.message.id}`);
        }
    }
    /**
     * Broadcast message to all subscribers
     */
    async broadcastMessage(message) {
        const allHandlers = [];
        // Collect all handlers from all topics
        for (const handlers of this.subscribers.values()) {
            allHandlers.push(...handlers);
        }
        // Deliver to all handlers
        await Promise.all(allHandlers.map(async (handler) => {
            try {
                await handler(message);
            }
            catch (error) {
                console.error('[MessageBus] Broadcast handler error:', error);
            }
        }));
    }
    /**
     * Send message to specific target
     */
    async unicastMessage(message, target) {
        const handlers = this.subscribers.get(target) || [];
        if (handlers.length === 0) {
            console.warn(`[MessageBus] No handlers found for target: ${target}`);
            return;
        }
        // Deliver to target handlers
        await Promise.all(handlers.map(async (handler) => {
            try {
                await handler(message);
            }
            catch (error) {
                console.error(`[MessageBus] Unicast handler error for ${target}:`, error);
            }
        }));
    }
    /**
     * Apply routing rules to determine message targets
     */
    applyRoutingRules(message) {
        const targets = [];
        for (const rule of this.routingRules) {
            if (!rule.enabled)
                continue;
            let matches = false;
            if (typeof rule.pattern === 'string') {
                matches = message.type === rule.pattern || message.source === rule.pattern;
            }
            else {
                matches = rule.pattern.test(message.type) || rule.pattern.test(message.source);
            }
            if (matches) {
                if (Array.isArray(rule.target)) {
                    targets.push(...rule.target);
                }
                else {
                    targets.push(rule.target);
                }
            }
        }
        return [...new Set(targets)]; // Remove duplicates
    }
    /**
     * Validate message format
     */
    validateMessage(message) {
        return !!(message.id &&
            message.type &&
            message.source &&
            message.target &&
            message.payload &&
            typeof message.timestamp === 'number' &&
            message.priority &&
            ['critical', 'high', 'normal', 'low'].includes(message.priority));
    }
    /**
     * Update performance metrics
     */
    updateMetrics(processingTime, success) {
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
    handleError(code, message, originalError) {
        const error = {
            code,
            message,
            details: originalError,
            timestamp: Date.now()
        };
        console.error(`[MessageBus] ${code}: ${message}`, originalError);
        // Emit error event to subscribers
        const errorMessage = {
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
    shutdown() {
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
const messageBus = MessageBus.getInstance();
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (messageBus)));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ./src/utils/MessageBus.ts
var MessageBus = __webpack_require__(776);
;// ./src/utils/AgentLifecycleManager.ts
/**
 * AccessiAI Agent Lifecycle Manager
 * Manages agent initialization, health monitoring, and automatic recovery
 * Provides comprehensive agent lifecycle management with failure recovery
 * Optimized for fast health checks and automatic failure recovery
 */

// ============================================================================
// AGENT LIFECYCLE MANAGER IMPLEMENTATION
// ============================================================================
class AgentLifecycleManager {
    // ============================================================================
    // CORE PROPERTIES
    // ============================================================================
    agents = new Map();
    healthCheckInterval = null;
    isShuttingDown = false;
    startupPromises = new Map();
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    config = {
        healthCheckInterval: 5000, // 5 seconds
        maxRestartAttempts: 3,
        restartDelay: 2000, // 2 seconds
        shutdownTimeout: 10000, // 10 seconds
        startupTimeout: 30000 // 30 seconds
    };
    // ============================================================================
    // PERFORMANCE METRICS
    // ============================================================================
    metrics = {
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
    static instance = null;
    static getInstance() {
        if (!AgentLifecycleManager.instance) {
            AgentLifecycleManager.instance = new AgentLifecycleManager();
        }
        return AgentLifecycleManager.instance;
    }
    constructor() {
        this.startHealthMonitoring();
        console.log('[AgentLifecycleManager] Initialized with comprehensive health monitoring');
    }
    // ============================================================================
    // AGENT REGISTRATION
    // ============================================================================
    /**
     * Register an agent for lifecycle management
     */
    async registerAgent(config, agentFactory) {
        try {
            if (this.agents.has(config.id)) {
                throw new Error(`Agent ${config.id} is already registered`);
            }
            console.log(`[AgentLifecycleManager] Registering agent: ${config.name}`);
            // Create agent instance
            const agent = agentFactory();
            // Create agent instance record
            const agentInstance = {
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
        }
        catch (error) {
            console.error(`[AgentLifecycleManager] Failed to register agent ${config.name}:`, error);
            throw error;
        }
    }
    /**
     * Unregister an agent from lifecycle management
     */
    async unregisterAgent(agentId) {
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
        }
        catch (error) {
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
    async startAgent(agentId) {
        const agentInstance = this.agents.get(agentId);
        if (!agentInstance) {
            throw new Error(`Agent ${agentId} not found`);
        }
        // Check if already starting
        if (this.startupPromises.has(agentId)) {
            return this.startupPromises.get(agentId);
        }
        const startupPromise = this.performAgentStartup(agentInstance);
        this.startupPromises.set(agentId, startupPromise);
        try {
            await startupPromise;
        }
        finally {
            this.startupPromises.delete(agentId);
        }
    }
    /**
     * Stop a specific agent
     */
    async stopAgent(agentId) {
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
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Shutdown timeout')), this.config.shutdownTimeout);
            });
            await Promise.race([stopPromise, timeoutPromise]);
            // Update metrics
            this.metrics.activeAgents--;
            this.updateAgentStatus(agentId, 'offline');
            console.log(`[AgentLifecycleManager] Agent ${agentInstance.config.name} stopped successfully`);
        }
        catch (error) {
            console.error(`[AgentLifecycleManager] Failed to stop agent ${agentInstance.config.name}:`, error);
            this.updateAgentStatus(agentId, 'error');
            throw error;
        }
    }
    /**
     * Start all registered agents
     */
    async startAllAgents() {
        console.log('[AgentLifecycleManager] Starting all agents...');
        // Sort agents by priority (higher priority first)
        const sortedAgents = Array.from(this.agents.values())
            .sort((a, b) => b.config.priority - a.config.priority);
        // Start agents in priority order
        for (const agentInstance of sortedAgents) {
            try {
                await this.startAgent(agentInstance.config.id);
            }
            catch (error) {
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
    async stopAllAgents() {
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
            }
            catch (error) {
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
    startHealthMonitoring() {
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
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        console.log('[AgentLifecycleManager] Health monitoring stopped');
    }
    /**
     * Perform health checks on all active agents
     */
    async performHealthChecks() {
        if (this.isShuttingDown) {
            return;
        }
        const startTime = performance.now();
        const healthCheckPromises = [];
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
    async checkAgentHealth(agentId) {
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
            }
            else {
                // Update heartbeat
                agentInstance.agent.updateHeartbeat();
            }
        }
        catch (error) {
            console.error(`[AgentLifecycleManager] Health check error for ${agentInstance.config.name}:`, error);
            await this.handleAgentFailure(agentId, error);
        }
    }
    // ============================================================================
    // FAILURE RECOVERY
    // ============================================================================
    /**
     * Handle agent failure and attempt recovery
     */
    async handleAgentFailure(agentId, error) {
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
            }
            catch (restartError) {
                console.error(`[AgentLifecycleManager] Failed to restart ${agentInstance.config.name}:`, restartError);
                // If max attempts reached, mark as permanently failed
                if (agentInstance.restartCount >= agentInstance.config.maxRestartAttempts) {
                    console.error(`[AgentLifecycleManager] Agent ${agentInstance.config.name} exceeded max restart attempts`);
                    this.updateAgentStatus(agentId, 'offline');
                }
            }
        }
        else {
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
    async restartAgent(agentId) {
        // Stop the agent first
        try {
            await this.stopAgent(agentId);
        }
        catch (error) {
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
    getSystemHealth() {
        const agents = Array.from(this.agents.values()).map(agentInstance => ({
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
    getAgentRegistry() {
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
    async performAgentStartup(agentInstance) {
        try {
            console.log(`[AgentLifecycleManager] Starting agent: ${agentInstance.config.name}`);
            // Update status
            this.updateAgentStatus(agentInstance.config.id, 'initializing');
            // Start the agent with timeout
            const startPromise = agentInstance.agent.start();
            const timeoutPromise = new Promise((_, reject) => {
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
        }
        catch (error) {
            console.error(`[AgentLifecycleManager] Failed to start agent ${agentInstance.config.name}:`, error);
            this.updateAgentStatus(agentInstance.config.id, 'error');
            throw error;
        }
    }
    /**
     * Subscribe to agent events
     */
    subscribeToAgentEvents(agent) {
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
    updateAgentStatus(agentId, status) {
        const agentInstance = this.agents.get(agentId);
        if (agentInstance) {
            this.updateAgentInstance(agentId, { status });
        }
    }
    /**
     * Update agent instance data
     */
    updateAgentInstance(agentId, updates) {
        const agentInstance = this.agents.get(agentId);
        if (agentInstance) {
            const updatedInstance = { ...agentInstance, ...updates };
            this.agents.set(agentId, updatedInstance);
        }
    }
    /**
     * Calculate overall system status
     */
    calculateSystemStatus(agents) {
        if (agents.length === 0) {
            return 'offline';
        }
        const activeAgents = agents.filter(a => a.status === 'active').length;
        const errorAgents = agents.filter(a => a.status === 'error').length;
        if (errorAgents > agents.length * 0.5) {
            return 'critical';
        }
        else if (errorAgents > 0 || activeAgents < agents.length * 0.8) {
            return 'degraded';
        }
        else {
            return 'healthy';
        }
    }
    /**
     * Calculate total memory usage
     */
    calculateTotalMemoryUsage() {
        return Array.from(this.agents.values())
            .reduce((total, agent) => total + agent.agent.getMetadata().performanceMetrics.resourceUsage, 0);
    }
    /**
     * Calculate total CPU usage
     */
    calculateTotalCpuUsage() {
        // Simplified CPU calculation based on active agents
        return (this.metrics.activeAgents / Math.max(this.metrics.totalAgents, 1)) * 100;
    }
    /**
     * Emit system event
     */
    async emitSystemEvent(type, data) {
        try {
            await MessageBus.messageBus.publish('system-events', {
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
        }
        catch (error) {
            console.error('[AgentLifecycleManager] Failed to emit system event:', error);
        }
    }
    // ============================================================================
    // CLEANUP
    // ============================================================================
    /**
     * Shutdown lifecycle manager
     */
    async shutdown() {
        console.log('[AgentLifecycleManager] Shutting down...');
        await this.stopAllAgents();
        this.agents.clear();
        console.log('[AgentLifecycleManager] Shutdown complete');
    }
}
// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
const agentLifecycleManager = AgentLifecycleManager.getInstance();
/* harmony default export */ var utils_AgentLifecycleManager = ((/* unused pure expression or super */ null && (agentLifecycleManager)));

;// ./src/agents/BaseAgent.ts
/**
 * BaseAgent - Abstract Foundation Class for All AccessiAI Agents
 * Modern TypeScript 5.6+ with strict typing and performance monitoring
 */
class BaseAgent {
    // ============================================================================
    // CORE PROPERTIES
    // ============================================================================
    agentId;
    agentName;
    agentVersion;
    capabilities;
    dependencies;
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    status = 'initializing';
    lastHeartbeat = Date.now();
    initializationTime = 0;
    shutdownTime = 0;
    // ============================================================================
    // PERFORMANCE TRACKING
    // ============================================================================
    performanceMetrics = {
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
    eventListeners = new Map();
    // ============================================================================
    // ERROR TRACKING
    // ============================================================================
    errorCount = 0;
    lastError = null;
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor(metadata) {
        this.agentId = metadata.id;
        this.agentName = metadata.name;
        this.agentVersion = metadata.version;
        this.capabilities = Object.freeze([...metadata.capabilities]);
        this.dependencies = Object.freeze([...metadata.dependencies]);
        // Initialize performance tracking
        this.startPerformanceTracking();
    }
    // ============================================================================
    // LIFECYCLE MANAGEMENT
    // ============================================================================
    /**
     * Start the agent lifecycle
     * Handles initialization and error recovery
     */
    async start() {
        try {
            this.status = 'initializing';
            this.initializationTime = Date.now();
            await this.initialize();
            this.status = 'active';
            this.updateHeartbeat();
            this.emitEvent('agent-started', { agentId: this.agentId });
            console.log(`[${this.agentName}] Agent started successfully`);
        }
        catch (error) {
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
    async stop() {
        try {
            this.status = 'shutting-down';
            this.shutdownTime = Date.now();
            await this.shutdown();
            this.status = 'offline';
            this.stopPerformanceTracking();
            this.emitEvent('agent-stopped', { agentId: this.agentId });
            console.log(`[${this.agentName}] Agent stopped successfully`);
        }
        catch (error) {
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
    getMetadata() {
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
    getStatus() {
        return this.status;
    }
    /**
     * Check if agent is healthy and operational
     */
    isHealthy() {
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
    updateHeartbeat() {
        this.lastHeartbeat = Date.now();
    }
    // ============================================================================
    // PERFORMANCE MONITORING
    // ============================================================================
    /**
     * Record a performance metric
     */
    recordMetric(name, value, timestamp = Date.now()) {
        switch (name) {
            case 'response_time':
                this.performanceMetrics.responseTime = this.calculateMovingAverage(this.performanceMetrics.responseTime, value, 0.1 // 10% weight for new values
                );
                break;
            case 'throughput':
                this.performanceMetrics.throughput = value;
                break;
            case 'error_rate':
                this.performanceMetrics.errorRate = this.calculateMovingAverage(this.performanceMetrics.errorRate, value, 0.1);
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
    calculateMovingAverage(current, newValue, weight) {
        return current * (1 - weight) + newValue * weight;
    }
    /**
     * Start performance tracking
     */
    startPerformanceTracking() {
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
    stopPerformanceTracking() {
        // Performance tracking stops automatically when agent is offline
    }
    // ============================================================================
    // ERROR HANDLING
    // ============================================================================
    /**
     * Create a standardized agent error
     */
    createAgentError(code, message, originalError) {
        const error = {
            code,
            message,
            details: originalError,
            timestamp: Date.now()
        };
        if (originalError instanceof Error && originalError.stack) {
            error.stack = originalError.stack;
        }
        return error;
    }
    /**
     * Record an error and update metrics
     */
    recordError(error) {
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
    emitEvent(type, data) {
        const event = {
            type,
            source: this.agentId,
            data,
            timestamp: Date.now()
        };
        const listeners = this.eventListeners.get(type) || [];
        listeners.forEach(listener => {
            try {
                listener(event);
            }
            catch (error) {
                console.error(`[${this.agentName}] Event listener error:`, error);
            }
        });
    }
    /**
     * Add event listener
     */
    addEventListener(type, listener) {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, []);
        }
        this.eventListeners.get(type).push(listener);
    }
    /**
     * Remove event listener
     */
    removeEventListener(type, listener) {
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
    validateMessage(message) {
        return !!(message.id &&
            message.type &&
            message.source &&
            message.target &&
            message.payload &&
            typeof message.timestamp === 'number');
    }
    /**
     * Create a standardized response
     */
    createResponse(success, data, error, processingTime = 0) {
        const response = {
            success,
            metadata: {
                agentId: this.agentId,
                agentName: this.agentName,
                timestamp: Date.now()
            },
            processingTime
        };
        if (data !== undefined) {
            response.data = data;
        }
        if (error !== undefined) {
            response.error = error;
        }
        return response;
    }
    /**
     * Create a success response
     */
    createSuccessResponse(data, processingTime = 0) {
        return this.createResponse(true, data, undefined, processingTime);
    }
    /**
     * Create an error response
     */
    createErrorResponse(error, processingTime = 0) {
        return this.createResponse(false, undefined, error, processingTime);
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Check if agent has specific capability
     */
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }
    /**
     * Check if agent has dependency
     */
    hasDependency(dependency) {
        return this.dependencies.includes(dependency);
    }
    /**
     * Get agent uptime in milliseconds
     */
    getUptime() {
        return this.status === 'active' ? Date.now() - this.initializationTime : 0;
    }
    /**
     * Get formatted agent info for logging
     */
    toString() {
        return `${this.agentName} (${this.agentId}) - Status: ${this.status}`;
    }
}

;// ./src/agents/PlaceholderAgent.ts
/**
 * PlaceholderAgent - Lightweight agent for system initialization
 * Provides basic agent functionality for system bootstrapping and testing
 */

class PlaceholderAgent extends BaseAgent {
    constructor(agentId, agentName, capabilities) {
        super({
            id: agentId,
            name: agentName,
            version: '2.0.0',
            capabilities,
            dependencies: []
        });
    }
    async initialize() {
        console.log(`[${this.agentName}] Placeholder agent initializing...`);
        console.log(`[${this.agentName}] Placeholder agent initialized successfully`);
    }
    async shutdown() {
        console.log(`[${this.agentName}] Placeholder agent shutting down...`);
        console.log(`[${this.agentName}] Placeholder agent shutdown complete`);
    }
    async processMessage(message) {
        console.log(`[${this.agentName}] Processing message:`, message.type);
        const startTime = performance.now();
        // Simple echo response for placeholder
        const response = {
            success: true,
            data: {
                message: `Placeholder response from ${this.agentName}`,
                originalMessage: message.type
            },
            processingTime: performance.now() - startTime
        };
        return response;
    }
    getConfiguration() {
        return {
            agentId: this.agentId,
            name: this.agentName,
            version: this.agentVersion,
            capabilities: this.capabilities,
            dependencies: this.dependencies,
            type: 'placeholder'
        };
    }
}

;// ./src/background.ts
/**
 * AccessiAI Background Service Worker
 * Chrome Extension Manifest V3 Service Worker
 * Manages agent lifecycle, message routing, and system coordination
 */


// ============================================================================
// SERVICE WORKER LIFECYCLE
// ============================================================================
console.log('[AccessiAI] Background service worker starting...');
// Service worker installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[AccessiAI] Extension installed:', details.reason);
    if (details.reason === 'install') {
        // First time installation
        initializeExtension();
    }
    else if (details.reason === 'update') {
        // Extension updated
        handleExtensionUpdate(details.previousVersion);
    }
});
// Service worker startup
chrome.runtime.onStartup.addListener(() => {
    console.log('[AccessiAI] Extension startup');
    initializeExtension();
});
// ============================================================================
// AGENT SYSTEM INITIALIZATION
// ============================================================================
class BackgroundServiceManager {
    agents = new Map();
    isInitialized = false;
    async initialize() {
        try {
            console.log('[AccessiAI] Initializing agent system...');
            // Initialize storage
            await this.initializeStorage();
            // Initialize message routing
            this.setupMessageRouting();
            // Initialize accessibility analysis agents
            await this.initializeAgents();
            this.isInitialized = true;
            console.log('[AccessiAI] Agent system initialized successfully');
        }
        catch (error) {
            console.error('[AccessiAI] Failed to initialize agent system:', error);
            throw error;
        }
    }
    async initializeStorage() {
        // Initialize IndexedDB for agent data storage
        // Provides persistent storage for accessibility analysis results and user preferences
        console.log('[AccessiAI] Storage initialized');
    }
    setupMessageRouting() {
        // Import and initialize message bus
        Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 776)).then(({ messageBus }) => {
            // Set up routing rules for agent communication
            messageBus.addRoutingRule({
                pattern: 'coordination-agent',
                target: 'coordination-agent',
                priority: 'high',
                enabled: true
            });
            messageBus.addRoutingRule({
                pattern: 'perception-agent',
                target: 'perception-agent',
                priority: 'normal',
                enabled: true
            });
            // Subscribe to system events
            messageBus.subscribe('system-health', async (message) => {
                console.log('[AccessiAI] System health event:', message);
            });
            messageBus.subscribe('agent-error', async (message) => {
                console.error('[AccessiAI] Agent error event:', message);
            });
            console.log('[AccessiAI] Message bus initialized with routing rules');
        }).catch(error => {
            console.error('[AccessiAI] Failed to initialize message bus:', error);
        });
    }
    async initializeAgents() {
        try {
            console.log('[AccessiAI] Initializing agent lifecycle management...');
            // Register system agents for accessibility analysis and coordination
            await this.registerPlaceholderAgents();
            // Start all registered agents
            await agentLifecycleManager.startAllAgents();
            console.log('[AccessiAI] Agent lifecycle management initialized successfully');
        }
        catch (error) {
            console.error('[AccessiAI] Failed to initialize agents:', error);
            throw error;
        }
    }
    async registerPlaceholderAgents() {
        try {
            console.log('[AccessiAI] Registering placeholder agents...');
            // Register core accessibility agents for DOM analysis and coordination
            const placeholderAgents = [
                {
                    id: 'coordination-agent',
                    name: 'Coordination Agent',
                    version: '2.0.0',
                    capabilities: ['message-routing', 'agent-coordination'],
                    dependencies: [],
                    priority: 1,
                    autoRestart: true,
                    maxRestartAttempts: 3,
                    healthCheckInterval: 5000
                },
                {
                    id: 'perception-agent',
                    name: 'Perception Agent',
                    version: '2.0.0',
                    capabilities: ['dom-analysis', 'accessibility-scanning'],
                    dependencies: ['coordination-agent'],
                    priority: 2,
                    autoRestart: true,
                    maxRestartAttempts: 3,
                    healthCheckInterval: 5000
                },
                {
                    id: 'adaptation-agent',
                    name: 'Adaptation Agent',
                    version: '2.0.0',
                    capabilities: ['dom-modification', 'accessibility-fixes'],
                    dependencies: ['perception-agent'],
                    priority: 3,
                    autoRestart: true,
                    maxRestartAttempts: 3,
                    healthCheckInterval: 5000
                }
            ];
            // Register each placeholder agent
            for (const agentConfig of placeholderAgents) {
                const agentFactory = () => new PlaceholderAgent(agentConfig.id, agentConfig.name, agentConfig.capabilities);
                await agentLifecycleManager.registerAgent(agentConfig, agentFactory);
                console.log(`[AccessiAI] Registered placeholder agent: ${agentConfig.name}`);
            }
            console.log(`[AccessiAI] Successfully registered ${placeholderAgents.length} placeholder agents`);
        }
        catch (error) {
            console.error('[AccessiAI] Failed to register placeholder agents:', error);
            throw error;
        }
    }
    getSystemHealth() {
        // Use AgentLifecycleManager for comprehensive health reporting
        const lifecycleHealth = agentLifecycleManager.getSystemHealth();
        return {
            ...lifecycleHealth,
            overallStatus: this.isInitialized ? lifecycleHealth.overallStatus : 'degraded'
        };
    }
}
// ============================================================================
// GLOBAL SERVICE MANAGER
// ============================================================================
const serviceManager = new BackgroundServiceManager();
// ============================================================================
// CHROME EXTENSION MESSAGE HANDLING
// ============================================================================
// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[AccessiAI] Received message:', message.type, 'from:', sender.tab?.url || 'popup');
    handleMessage(message, sender)
        .then(response => {
        sendResponse(response);
    })
        .catch(error => {
        console.error('[AccessiAI] Message handling error:', error);
        sendResponse({
            success: false,
            error: {
                code: 'MESSAGE_HANDLING_ERROR',
                message: error.message,
                timestamp: Date.now()
            }
        });
    });
    // Return true to indicate we'll send response asynchronously
    return true;
});
async function handleMessage(message, _sender) {
    try {
        if (!message || !message.type) {
            throw new Error('Invalid message format');
        }
        switch (message.type) {
            case 'GET_SYSTEM_HEALTH':
                return {
                    success: true,
                    data: serviceManager.getSystemHealth()
                };
            case 'GET_MESSAGE_BUS_STATUS':
                // Get message bus metrics
                const { messageBus } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 776));
                return {
                    success: true,
                    data: {
                        metrics: messageBus.getMetrics(),
                        queueStatus: messageBus.getQueueStatus()
                    }
                };
            case 'ANALYZE_PAGE_CONTENT':
                // Route to perception agent via message bus
                try {
                    const { messageBus } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 776));
                    const agentMessage = {
                        id: `analyze-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                        type: 'command',
                        source: 'background-service',
                        target: 'perception-agent',
                        payload: {
                            action: 'analyze-page',
                            data: message.data
                        },
                        timestamp: Date.now(),
                        priority: 'normal'
                    };
                    await messageBus.route(agentMessage);
                    return {
                        success: true,
                        data: { message: 'Page analysis request routed to perception agent' }
                    };
                }
                catch (error) {
                    console.error('[AccessiAI] Failed to route analysis request:', error);
                    return {
                        success: false,
                        error: {
                            code: 'ROUTING_FAILED',
                            message: 'Failed to route page analysis request',
                            timestamp: Date.now()
                        }
                    };
                }
            case 'ANALYZE_PAGE':
                // Legacy support - redirect to new message format
                return handleMessage({ type: 'ANALYZE_PAGE_CONTENT', data: message.data }, _sender);
            case 'GET_AGENT_STATUS':
                return {
                    success: true,
                    data: {
                        initialized: serviceManager['isInitialized'],
                        agentCount: serviceManager['agents'].size,
                        lifecycleMetrics: agentLifecycleManager.getMetrics(),
                        agentRegistry: Array.from(agentLifecycleManager.getAgentRegistry().keys())
                    }
                };
            case 'GET_LIFECYCLE_STATUS':
                // Get detailed lifecycle management status
                return {
                    success: true,
                    data: {
                        metrics: agentLifecycleManager.getMetrics(),
                        agentRegistry: Array.from(agentLifecycleManager.getAgentRegistry().entries()).map(([id, instance]) => ({
                            id,
                            name: instance.config.name,
                            status: instance.status,
                            startTime: instance.startTime,
                            restartCount: instance.restartCount,
                            lastHealthCheck: instance.lastHealthCheck
                        }))
                    }
                };
            default:
                console.warn(`[AccessiAI] Unknown message type: ${message.type}`);
                return {
                    success: false,
                    error: {
                        code: 'UNKNOWN_MESSAGE_TYPE',
                        message: `Unknown message type: ${message.type}`,
                        timestamp: Date.now()
                    }
                };
        }
    }
    catch (error) {
        console.error('[AccessiAI] Message handling error:', error);
        return {
            success: false,
            error: {
                code: 'MESSAGE_HANDLING_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            }
        };
    }
}
// ============================================================================
// CONTENT SCRIPT COMMUNICATION
// ============================================================================
// Handle content script connections
chrome.runtime.onConnect.addListener((port) => {
    console.log('[AccessiAI] Content script connected:', port.name);
    port.onMessage.addListener((message) => {
        console.log('[AccessiAI] Port message:', message);
        // Handle real-time communication with content scripts
    });
    port.onDisconnect.addListener(() => {
        console.log('[AccessiAI] Content script disconnected:', port.name);
    });
});
// ============================================================================
// EXTENSION LIFECYCLE FUNCTIONS
// ============================================================================
async function initializeExtension() {
    try {
        await serviceManager.initialize();
        console.log('[AccessiAI] Extension initialization complete');
    }
    catch (error) {
        console.error('[AccessiAI] Extension initialization failed:', error);
    }
}
function handleExtensionUpdate(previousVersion) {
    console.log('[AccessiAI] Extension updated from version:', previousVersion);
    // Handle any migration logic here
}
async function handleExtensionShutdown() {
    try {
        console.log('[AccessiAI] Extension shutting down...');
        // Shutdown agent lifecycle manager
        await agentLifecycleManager.shutdown();
        console.log('[AccessiAI] Extension shutdown complete');
    }
    catch (error) {
        console.error('[AccessiAI] Error during extension shutdown:', error);
    }
}
// ============================================================================
// ERROR HANDLING
// ============================================================================
// Global error handler
self.addEventListener('error', (event) => {
    console.error('[AccessiAI] Service worker error:', event.error);
});
self.addEventListener('unhandledrejection', (event) => {
    console.error('[AccessiAI] Unhandled promise rejection:', event.reason);
});
// Handle extension shutdown
chrome.runtime.onSuspend.addListener(() => {
    handleExtensionShutdown().catch(error => {
        console.error('[AccessiAI] Failed to shutdown gracefully:', error);
    });
});
// ============================================================================
// INITIALIZATION
// ============================================================================
// Start the service worker
console.log('[AccessiAI] Starting background service worker initialization...');
initializeExtension().then(() => {
    console.log('[AccessiAI] Background service worker initialization completed successfully');
}).catch(error => {
    console.error('[AccessiAI] Failed to start service worker:', error);
});
console.log('[AccessiAI] Background service worker loaded');

/******/ })()
;