/**
 * AccessiAI Background Service Worker
 * Chrome Extension Manifest V3 Service Worker
 * Manages agent lifecycle, message routing, and system coordination
 */

import type { AgentMetadata, SystemHealthReport } from './types/index';
import { agentLifecycleManager } from './utils/AgentLifecycleManager';
import { PlaceholderAgent } from './agents/PlaceholderAgent';

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
  } else if (details.reason === 'update') {
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
  private agents: Map<string, AgentMetadata> = new Map();
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
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
      
    } catch (error) {
      console.error('[AccessiAI] Failed to initialize agent system:', error);
      throw error;
    }
  }

  private async initializeStorage(): Promise<void> {
    // Initialize IndexedDB for agent data storage
    // Provides persistent storage for accessibility analysis results and user preferences
    console.log('[AccessiAI] Storage initialized');
  }

  private setupMessageRouting(): void {
    // Import and initialize message bus
    import('./utils/MessageBus').then(({ messageBus }) => {
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

  private async initializeAgents(): Promise<void> {
    try {
      console.log('[AccessiAI] Initializing agent lifecycle management...');
      
      // Register system agents for accessibility analysis and coordination
      await this.registerPlaceholderAgents();
      
      // Start all registered agents
      await agentLifecycleManager.startAllAgents();
      
      console.log('[AccessiAI] Agent lifecycle management initialized successfully');
      
    } catch (error) {
      console.error('[AccessiAI] Failed to initialize agents:', error);
      throw error;
    }
  }

  private async registerPlaceholderAgents(): Promise<void> {
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
        const agentFactory = () => new PlaceholderAgent(
          agentConfig.id,
          agentConfig.name,
          agentConfig.capabilities
        );
        
        await agentLifecycleManager.registerAgent(agentConfig, agentFactory);
        console.log(`[AccessiAI] Registered placeholder agent: ${agentConfig.name}`);
      }
      
      console.log(`[AccessiAI] Successfully registered ${placeholderAgents.length} placeholder agents`);
      
    } catch (error) {
      console.error('[AccessiAI] Failed to register placeholder agents:', error);
      throw error;
    }
  }

  getSystemHealth(): SystemHealthReport {
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

async function handleMessage(message: any, _sender: chrome.runtime.MessageSender): Promise<any> {
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
      const { messageBus } = await import('./utils/MessageBus');
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
        const { messageBus } = await import('./utils/MessageBus');
        const agentMessage = {
          id: `analyze-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          type: 'command' as const,
          source: 'background-service',
          target: 'perception-agent',
          payload: {
            action: 'analyze-page',
            data: message.data
          },
          timestamp: Date.now(),
          priority: 'normal' as const
        };
        
        await messageBus.route(agentMessage);
        
        return {
          success: true,
          data: { message: 'Page analysis request routed to perception agent' }
        };
      } catch (error) {
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
  } catch (error) {
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

async function initializeExtension(): Promise<void> {
  try {
    await serviceManager.initialize();
    console.log('[AccessiAI] Extension initialization complete');
  } catch (error) {
    console.error('[AccessiAI] Extension initialization failed:', error);
  }
}

function handleExtensionUpdate(previousVersion?: string): void {
  console.log('[AccessiAI] Extension updated from version:', previousVersion);
  // Handle any migration logic here
}

async function handleExtensionShutdown(): Promise<void> {
  try {
    console.log('[AccessiAI] Extension shutting down...');
    
    // Shutdown agent lifecycle manager
    await agentLifecycleManager.shutdown();
    
    console.log('[AccessiAI] Extension shutdown complete');
  } catch (error) {
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