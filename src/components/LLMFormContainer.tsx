import React from 'react';
import { LLMFormConfig } from '../types';
import { useLLMForm } from '../hooks/useLLMForm';
import { ToolForm } from './ToolForm';

export interface LLMFormContainerProps extends LLMFormConfig {
  /**
   * Initial context to send to the LLM (e.g., page URL, user intent, app state)
   */
  initialContext: string;

  /**
   * Custom rendering for assistant messages between forms
   */
  renderMessage?: (message: string) => React.ReactNode;

  /**
   * Custom rendering for the loading state
   */
  renderLoading?: () => React.ReactNode;

  /**
   * Additional class name for the container
   */
  className?: string;
}

export function LLMFormContainer({
  tools,
  client,
  systemMessage,
  initialContext,
  onToolSubmit,
  onError,
  renderMessage,
  renderLoading,
  className,
}: LLMFormContainerProps) {
  const { currentTool, currentMessage, isLoading, error, submitTool } = useLLMForm({
    tools,
    client,
    systemMessage,
    initialContext,
    onToolSubmit,
    onError,
  });

  return (
    <div className={className || 'llm-form-container'}>
      {/* Error display */}
      {error && (
        <div className="llm-form-error-container">
          Error: {error.message}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !currentTool && (
        renderLoading ? (
          renderLoading()
        ) : (
          <div className="llm-form-loading">
            <div className="llm-form-loading-icon">⏳</div>
            <p className="llm-form-loading-text">Loading...</p>
          </div>
        )
      )}

      {/* Assistant message (shown between forms) */}
      {!isLoading && !currentTool && currentMessage && (
        renderMessage ? (
          renderMessage(currentMessage)
        ) : (
          <div className="llm-form-message">
            <p className="llm-form-message-text">{currentMessage}</p>
          </div>
        )
      )}

      {/* Tool form */}
      {currentTool && (
        <ToolForm
          tool={currentTool}
          onSubmit={submitTool}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
