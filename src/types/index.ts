import { z } from 'zod';

/**
 * Represents a parameter in a tool definition
 */
export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  enum?: string[] | number[];
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
  default?: unknown;
}

/**
 * Represents a tool/function that the LLM can call
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
}

/**
 * Message in the conversation
 */
export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  name?: string;
}

/**
 * Tool call made by the LLM
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * LLM client interface - users implement this for their provider
 */
export interface LLMClient {
  /**
   * Send messages to the LLM and get a response
   * @param messages - Conversation history
   * @param tools - Available tools the LLM can call
   * @returns The LLM's response message
   */
  sendMessage(messages: Message[], tools: ToolDefinition[]): Promise<Message>;
}

/**
 * Form field configuration derived from tool parameters
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'textarea';
  description?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: unknown;
}

/**
 * Configuration for the LLM form
 */
export interface LLMFormConfig {
  /**
   * Available tools that can be rendered as forms
   */
  tools: ToolDefinition[];

  /**
   * LLM client for making API calls
   */
  client: LLMClient;

  /**
   * Initial system message/prompt
   */
  systemMessage?: string;

  /**
   * Callback when a tool is successfully submitted
   */
  onToolSubmit?: (toolName: string, data: Record<string, unknown>) => void | Promise<void>;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * State of the LLM form interaction
 */
export interface LLMFormState {
  /**
   * Current messages in the conversation
   */
  messages: Message[];

  /**
   * Current tool being requested by the LLM
   */
  currentTool: ToolDefinition | null;

  /**
   * Whether the LLM is processing
   */
  isLoading: boolean;

  /**
   * Any error that occurred
   */
  error: Error | null;
}
