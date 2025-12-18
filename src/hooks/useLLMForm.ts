import { useState, useCallback, useEffect } from 'react';
import { LLMFormConfig, LLMFormState, Message, ToolDefinition } from '../types';

export interface UseLLMFormConfig extends LLMFormConfig {
  /**
   * Initial context to send to the LLM (e.g., page URL, user intent, app state)
   */
  initialContext: string;
}

export function useLLMForm(config: UseLLMFormConfig) {
  const [state, setState] = useState<LLMFormState>({
    messages: [],
    currentTool: null,
    isLoading: true, // Start in loading state
    error: null,
  });

  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  // Initialize: send initial context to LLM on mount
  useEffect(() => {
    const initialize = async () => {
      const initialMessages: Message[] = [];

      if (config.systemMessage) {
        initialMessages.push({
          role: 'assistant',
          content: config.systemMessage,
        });
      }

      initialMessages.push({
        role: 'user',
        content: config.initialContext,
      });

      try {
        const response = await config.client.sendMessage(initialMessages, config.tools);

        // If the LLM made a tool call, set it as the current tool
        let currentTool: ToolDefinition | null = null;
        if (response.toolCalls && response.toolCalls.length > 0) {
          const toolCall = response.toolCalls[0];
          currentTool = config.tools.find((t) => t.name === toolCall.name) || null;
        }

        setState({
          messages: [...initialMessages, response],
          currentTool,
          isLoading: false,
          error: null,
        });

        setCurrentMessage(response.content || null);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState({
          messages: initialMessages,
          currentTool: null,
          isLoading: false,
          error: err,
        });
        config.onError?.(err);
      }
    };

    initialize();
  }, []); // Only run on mount

  /**
   * Submit the current tool form with user data
   */
  const submitTool = useCallback(
    async (data: Record<string, unknown>) => {
      if (!state.currentTool) {
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        await config.onToolSubmit?.(state.currentTool.name, data);

        // Create a tool result message
        const lastAssistantMessage = [...state.messages].reverse().find((m) => m.role === 'assistant');
        const toolCallId = lastAssistantMessage?.toolCalls?.[0]?.id || 'unknown';

        const toolResultMessage: Message = {
          role: 'tool',
          content: JSON.stringify(data),
          toolCallId,
          name: state.currentTool.name,
        };

        const newMessages = [...state.messages, toolResultMessage];

        // Get the LLM's next response
        const response = await config.client.sendMessage(newMessages, config.tools);

        // Check if there's another tool call
        let currentTool: ToolDefinition | null = null;
        if (response.toolCalls && response.toolCalls.length > 0) {
          const toolCall = response.toolCalls[0];
          currentTool = config.tools.find((t) => t.name === toolCall.name) || null;
        }

        setState({
          messages: [...newMessages, response],
          currentTool,
          isLoading: false,
          error: null,
        });

        setCurrentMessage(response.content || null);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err,
        }));
        config.onError?.(err);
      }
    },
    [state.currentTool, state.messages, config]
  );

  return {
    ...state,
    currentMessage,
    submitTool,
  };
}
