/**
 * PlaceholderAgent - Lightweight agent for system initialization
 * Provides basic agent functionality for system bootstrapping and testing
 */
import { BaseAgent } from './BaseAgent';
import type { AgentMessage, AgentResponse } from '../types/index';
export declare class PlaceholderAgent extends BaseAgent {
    constructor(agentId: string, agentName: string, capabilities: string[]);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    processMessage(message: AgentMessage): Promise<AgentResponse>;
    getConfiguration(): Record<string, unknown>;
}
//# sourceMappingURL=PlaceholderAgent.d.ts.map