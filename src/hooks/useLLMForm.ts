import { useState, useCallback } from 'react';
import { LLMFormConfig, LLMFormState, Message, ToolDefinition } from '../types';

export function useLLMForm(config: LLMFormConfig) {
  const [state, setState] = useState<LLMFormState>({
    messages: config.systemMessage
      ? [{ role: 'assistant', content: config.systemMessage }]
      : [],
    currentTool: null,
    isLoading: false,
    error: null,
  });

  /**
   * Send a user message and get the LLM's response
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const userMsg: Message = {
        role: 'user',
        content: userMessage,
      };

      const newMessages = [...state.messages, userMsg];

      try {
        const response = await config.client.sendMessage(newMessages, config.tools);

        // If the LLM made a tool call, set it as the current tool
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
    [state.messages, config]
  );

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

  /**
   * Cancel the current tool form
   */
  const cancelTool = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentTool: null,
    }));
  }, []);

  /**
   * Reset the entire conversation
   */
  const reset = useCallback(() => {
    setState({
      messages: config.systemMessage
        ? [{ role: 'assistant', content: config.systemMessage }]
        : [],
      currentTool: null,
      isLoading: false,
      error: null,
    });
  }, [config.systemMessage]);

  return {
    ...state,
    sendMessage,
    submitTool,
    cancelTool,
    reset,
  };
}
