/**
 * PlaceholderAgent - Lightweight agent for system initialization
 * Provides basic agent functionality for system bootstrapping and testing
 */

import { BaseAgent } from './BaseAgent';
import type { AgentMessage, AgentResponse } from '../types/index';

export class PlaceholderAgent extends BaseAgent {
  constructor(agentId: string, agentName: string, capabilities: string[]) {
    super({
      id: agentId,
      name: agentName,
      version: '2.0.0',
      capabilities,
      dependencies: []
    });
  }

  override async initialize(): Promise<void> {
    console.log(`[${this.agentName}] Placeholder agent initializing...`);
    console.log(`[${this.agentName}] Placeholder agent initialized successfully`);
  }

  override async shutdown(): Promise<void> {
    console.log(`[${this.agentName}] Placeholder agent shutting down...`);
    console.log(`[${this.agentName}] Placeholder agent shutdown complete`);
  }

  override async processMessage(message: AgentMessage): Promise<AgentResponse> {
    console.log(`[${this.agentName}] Processing message:`, message.type);
    
    const startTime = performance.now();
    
    // Simple echo response for placeholder
    const response: AgentResponse = {
      success: true,
      data: {
        message: `Placeholder response from ${this.agentName}`,
        originalMessage: message.type
      },
      processingTime: performance.now() - startTime
    };
    
    return response;
  }

  override getConfiguration(): Record<string, unknown> {
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